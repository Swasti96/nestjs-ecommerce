import React from 'react';
import { Product } from '../types';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      background: product.isActive ? '#f0fff4' : '#fffaf0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{product.title ?? 'Sin título'}</h3>
        <span style={{
          padding: '2px 10px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          background: product.isActive ? '#c6f6d5' : '#feebc8',
          color: product.isActive ? '#276749' : '#744210',
        }}>
          {product.isActive ? 'Activo' : 'Borrador'}
        </span>
      </div>
      <p style={{ color: '#666', margin: '8px 0 4px', fontSize: 13 }}>
        Código: {product.code ?? '—'} · Categoría: {product.categoryId} · Tipo: {product.variationType ?? '—'}
      </p>
      {product.description && (
        <p style={{ fontSize: 13, color: '#444', margin: 0 }}>{product.description}</p>
      )}
    </div>
  );
}