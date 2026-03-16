import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { RoleIds } from 'src/api/role/enum/role.enum';
import { FindOneParams } from 'src/common/helper/findOneParams.dto';
import { IsNumber, IsIn, IsOptional } from 'class-validator';

class UpdateStockDto {
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsIn(['manual_update', 'order', 'adjustment'])
  reason?: 'manual_update' | 'order' | 'adjustment';
}

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:id')
  getByProduct(@Param() params: FindOneParams) {
    return this.inventoryService.getInventoryByProduct(params.id);
  }

  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Patch(':id/stock')
  updateStock(
    @Param() params: FindOneParams,
    @Body() body: UpdateStockDto,
  ) {
    return this.inventoryService.updateStock(params.id, body.quantity, body.reason);
  }
}