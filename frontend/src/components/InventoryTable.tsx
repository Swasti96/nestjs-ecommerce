import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { inventoryApi } from '../api/client';

interface Props {
  inventory: InventoryItem[];
  onStockUpdated: () => void;
}

export function InventoryTable({ inventory, onStockUpdated }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (inventoryId: number) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) return;

    setUpdating(true);
    try {
      await inventoryApi.updateStock(inventoryId, quantity);
      setEditingId(null);
      setNewQuantity('');
      onStockUpdated(); 
    } catch (err) {
      console.error('Error actualizando stock:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (inventory.length === 0) {
    return (
      <p style={{ color: '#888', fontStyle: 'italic' }}>
        Sin registros de inventario. Activá el producto para inicializarlo.
      </p>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ background: '#f0f0f0' }}>
          <th style={th}>ID</th>
          <th style={th}>Variación</th>
          <th style={th}>Talle</th>
          <th style={th}>Color</th>
          <th style={th}>País</th>
          <th style={th}>Stock</th>
          <th style={th}>Última actualización</th>
          <th style={th}>Acción</th>
        </tr>
      </thead>
      <tbody>
        {inventory.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={td}>{item.id}</td>
            <td style={td}>{item.productVariationId}</td>
            <td style={td}>{item.productVariation?.sizeCode ?? '—'}</td>
            <td style={td}>{item.productVariation?.colorName ?? '—'}</td>
            <td style={td}>{item.countryCode}</td>
            <td style={{ ...td, fontWeight: 'bold', color: item.quantity === 0 ? '#e53e3e' : '#2f855a' }}>
              {item.quantity}
            </td>
            <td style={{ ...td, color: '#888', fontSize: 12 }}>
              {new Date(item.updatedAt).toLocaleTimeString()}
            </td>
            <td style={td}>
              {editingId === item.id ? (
                <span>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    style={{ width: 60, marginRight: 6 }}
                    min={0}
                  />
                  <button onClick={() => handleUpdate(item.id)} disabled={updating}>
                    {updating ? '...' : 'OK'}
                  </button>
                  <button onClick={() => setEditingId(null)} style={{ marginLeft: 4 }}>
                    ✕
                  </button>
                </span>
              ) : (
                <button onClick={() => { setEditingId(item.id); setNewQuantity(String(item.quantity)); }}>
                  Editar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td: React.CSSProperties = { padding: '8px 12px' };