import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { ProductActivatedListener } from './listeners/product-activated.listener';
import { InventoryUpdatedListener } from './listeners/inventory-updated.listener';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, ProductVariation]),
    UserModule,
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    ProductActivatedListener,
    InventoryUpdatedListener,
  ],
})
export class InventoryModule {}