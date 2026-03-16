import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { InventoryUpdatedEvent, INVENTORY_UPDATED } from 'src/events/domain-events';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ProductVariation)
    private readonly variationRepo: Repository<ProductVariation>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getInventoryByProduct(productId: number) {
    return this.inventoryRepo.find({
      where: { productVariation: { productId } },
      relations: ['productVariation', 'country'],
    });
  }

  async updateStock(
    inventoryId: number,
    quantity: number,
    reason: 'manual_update' | 'order' | 'adjustment' = 'manual_update',
  ) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id: inventoryId },
    });
    if (!inventory) throw new NotFoundException('Inventory record not found');

    const previousQuantity = inventory.quantity;
    inventory.quantity = quantity;
    const updated = await this.inventoryRepo.save(inventory);

    // Emitir evento de dominio
    this.eventEmitter.emit(
      INVENTORY_UPDATED,
      new InventoryUpdatedEvent(
        inventory.productVariationId,
        previousQuantity,
        quantity,
        reason,
      ),
    );

    return updated;
  }

  // Llamado por el listener cuando se activa un producto
  async initializeStockForVariations(productId: number) {
    const variations = await this.variationRepo.find({
      where: { productId },
    });

    if (variations.length === 0) return [];

    const records = variations.map((v) =>
      this.inventoryRepo.create({
        productVariationId: v.id,
        countryCode: 'ARG', // default, extensible
        quantity: 0,
      }),
    );

    return this.inventoryRepo.save(records);
  }
}