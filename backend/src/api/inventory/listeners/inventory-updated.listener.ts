import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryUpdatedEvent, INVENTORY_UPDATED } from 'src/events/domain-events';

@Injectable()
export class InventoryUpdatedListener {
  private readonly logger = new Logger(InventoryUpdatedListener.name);

  @OnEvent(INVENTORY_UPDATED)
  handle(event: InventoryUpdatedEvent) {
    this.logger.log(
      `Inventory updated — variation ${event.productVariationId}: ` +
      `${event.previousQuantity} → ${event.newQuantity} (${event.reason})`,
    );
    // Punto de extensión: notificaciones, alertas de stock bajo, auditoría, etc.
  }
}