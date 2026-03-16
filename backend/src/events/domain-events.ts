export class ProductActivatedEvent {
  constructor(
    public readonly productId: number,
    public readonly merchantId: number,
  ) {}
}

export class InventoryUpdatedEvent {
  constructor(
    public readonly productVariationId: number,
    public readonly previousQuantity: number,
    public readonly newQuantity: number,
    public readonly reason: 'manual_update' | 'order' | 'adjustment',
  ) {}
}

export const PRODUCT_ACTIVATED = 'product.activated';
export const INVENTORY_UPDATED = 'inventory.updated';