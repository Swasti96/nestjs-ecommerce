import React, { useCallback, useState } from 'react';
import { inventoryApi, productApi } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import { useSocket } from '../hooks/useSocket';
import { ProductCard } from '../components/ProductCard';
import { InventoryTable } from '../components/InventoryTable';
import { ApiResponse, InventoryItem, Product } from '../types';

interface Props {
  onLogout: () => void;
}

export function DashboardPage({ onLogout }: Props) {
  const [productId, setProductId] = useState<string>('1');
  const [activeProductId, setActiveProductId] = useState<number>(1);

  const fetchProduct = useCallback(async () => {
  try {
    const res = await productApi.getById(activeProductId);
    const body: ApiResponse<Product> = res.data;
    return body.data;
  } catch (err) {
    return null;
  }
}, [activeProductId]);

  const fetchInventory = useCallback(async () => {
  try {
    const res = await inventoryApi.getByProduct(activeProductId);
    const body: ApiResponse<InventoryItem[]> = res.data;
    return body.data;
  } catch (err) {
    return null;
  }
}, [activeProductId]);

  const {
    data: product,
    loading: productLoading,
    lastUpdated: productUpdated,
    refetch: refetchProduct,
  } = usePolling(fetchProduct, 60000, false); 

  const {
    data: inventory,
    loading: inventoryLoading,
    lastUpdated: inventoryUpdated,
    refetch: refetchInventory,
  } = usePolling(fetchInventory, 60000, false); 

  const { isConnected } = useSocket(
    useCallback(() => {
      refetchInventory();
    }, [refetchInventory]),
    useCallback(() => {
      refetchProduct();
      refetchInventory();
    }, [refetchProduct, refetchInventory]),
  );

  React.useEffect(() => {
    refetchProduct();
    refetchInventory();
  }, [activeProductId]);

  const handleSearch = () => {
    const id = parseInt(productId);
    if (!isNaN(id) && id > 0) setActiveProductId(id);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Dashboard — E-commerce</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 10,
            background: isConnected ? '#c6f6d5' : '#feebc8',
            color: isConnected ? '#276749' : '#744210',
          }}>
            {isConnected ? '⚡ WebSocket' : '⏱ Polling fallback'}
          </span>
          <button onClick={onLogout} style={{ padding: '6px 14px', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </div>


      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="ID de producto"
          style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc', width: 160 }}
          min={1}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '8px 16px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Buscar
        </button>
      </div>


      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>Producto</h2>
          {productUpdated && (
            <span style={{ fontSize: 11, color: '#888' }}>
              Actualizado: {productUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        {productLoading ? (
          <p>Cargando producto...</p>
        ) : product ? (
          <ProductCard product={product} />
        ) : (
          <p style={{ color: '#888' }}>Producto no encontrado.</p>
        )}
      </section>


      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>Inventario</h2>
          {inventoryUpdated && (
            <span style={{ fontSize: 11, color: '#888' }}>
              Actualizado: {inventoryUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        {inventoryLoading ? (
          <p>Cargando inventario...</p>
        ) : (
          <InventoryTable
            inventory={inventory ?? []}
            onStockUpdated={refetchInventory}
          />
        )}
      </section>
    </div>
  );
}