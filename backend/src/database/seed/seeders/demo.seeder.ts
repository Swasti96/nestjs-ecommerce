import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { hash } from 'bcrypt';
import { SeederInterface } from '../seeder.interface';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/entities/role.entity';
import { Product } from 'src/database/entities/product.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Category } from 'src/database/entities/category.entity';
import { Size } from 'src/database/entities/size.entity';
import { Color } from 'src/database/entities/color.entity';

@Injectable()
export class DemoSeeder implements SeederInterface {
  private readonly logger = new Logger(DemoSeeder.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async seed() {
    await this.entityManager.transaction(async (em) => {

      // 1. Crear usuario merchant de demo
      const existingUser = await em.findOne(User, {
        where: { email: 'merchant@demo.com' },
      });

      let merchant: User;

      if (!existingUser) {
        const hashedPassword = await hash('Demo1234!', 10);
        const merchantRole = await em.findOne(Role, { where: { id: 2 } });

        merchant = em.create(User, {
          email: 'merchant@demo.com',
          password: hashedPassword,
          roles: [merchantRole],
        });
        merchant = await em.save(merchant);
        this.logger.log('Demo merchant user created');
      } else {
        merchant = existingUser;
        this.logger.log('Demo merchant user already exists, skipping');
      }

      // 2. Crear producto demo
      const existingProduct = await em.findOne(Product, {
        where: { code: 'DEMO-001' },
      });

      if (existingProduct) {
        this.logger.log('Demo product already exists, skipping');
        return;
      }

      const category = await em.findOne(Category, { where: { id: 1 } });

      const product = em.create(Product, {
        code: 'DEMO-001',
        title: 'Laptop Demo XPS 15',
        description: 'Laptop de demostración para el challenge técnico',
        variationType: 'OnlyColor',
        about: ['Procesador Intel i7', 'RAM 16GB', 'SSD 512GB'],
        details: {
          category: 'Computers',
          capacity: 512,
          capacityUnit: 'GB',
          capacityType: 'SSD',
          brand: 'Dell',
          series: 'XPS',
        },
        isActive: true,
        merchantId: merchant.id,
        categoryId: category.id,
        category,
      });

      const savedProduct = await em.save(product);
      this.logger.log(`Demo product created with id ${savedProduct.id}`);

        // 3. Crear variaciones del producto
        const redColor = await em.findOne(Color, { where: { name: 'red' } });
        const blueColor = await em.findOne(Color, { where: { name: 'blue' } });
        const sizeM = await em.findOne(Size, { where: { code: 'M' } });

        const colors = [redColor, blueColor].filter(Boolean);

        if (colors.length === 0 || !sizeM) {
        this.logger.warn('Colors or size not found, skipping variations');
        return;
        }

        const variations: ProductVariation[] = [];
        for (const color of colors) {
        const variation = em.create(ProductVariation, {
            productId: savedProduct.id,
            sizeCode: sizeM.code,
            colorName: color.name,
            imageUrls: [],
        });
        const saved = await em.save(variation);
        variations.push(saved);
        this.logger.log(`Variation created: ${color.name}`);
        }

      // 4. Crear inventario para cada variación
      for (const variation of variations) {
        const inventory = em.create(Inventory, {
          productVariationId: variation.id,
          countryCode: 'EG',
          quantity: 10,
        });
        await em.save(inventory);
        this.logger.log(`Inventory created for variation ${variation.id}: qty 10`);
      }
    });
  }
}