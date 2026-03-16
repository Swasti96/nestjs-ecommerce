import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  INVENTORY_UPDATED,
  PRODUCT_ACTIVATED,
  InventoryUpdatedEvent,
  ProductActivatedEvent,
} from 'src/events/domain-events';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events',
})
export class InventoryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(InventoryGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent(INVENTORY_UPDATED)
  handleInventoryUpdated(event: InventoryUpdatedEvent) {
    this.logger.log(`Pushing inventory.updated to all clients`);
    this.server.emit('inventory.updated', {
      productVariationId: event.productVariationId,
      previousQuantity: event.previousQuantity,
      newQuantity: event.newQuantity,
      reason: event.reason,
    });
  }

  @OnEvent(PRODUCT_ACTIVATED)
  handleProductActivated(event: ProductActivatedEvent) {
    this.logger.log(`Pushing product.activated to all clients`);
    this.server.emit('product.activated', {
      productId: event.productId,
      merchantId: event.merchantId,
    });
  }
}