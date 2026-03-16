import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryService } from '../services/inventory.service';
import { ProductActivatedEvent, PRODUCT_ACTIVATED } from 'src/events/domain-events';

@Injectable()
export class ProductActivatedListener {
  private readonly logger = new Logger(ProductActivatedListener.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @OnEvent(PRODUCT_ACTIVATED)
  async handle(event: ProductActivatedEvent) {
    this.logger.log(
      `Product ${event.productId} activated — initializing inventory`,
    );
    await this.inventoryService.initializeStockForVariations(event.productId);
  }
}