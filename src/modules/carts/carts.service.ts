import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AddToCartDto } from '@/modules/carts/dto/add-to-cart.dto';
import { EditCartDto } from '@/modules/carts/dto/edit-cart.dto';
import { CartsRepository } from './carts.repository';

@Injectable()
export class CartsService {
  constructor(private readonly repository: CartsRepository) {}

  async getCart(userId: string) {
    return await this.repository.getUserCartInfo(userId);
  }

  async addToCart(dto: AddToCartDto, userId: string) {
    const productVariant = await this.repository.getProductVariant(
      dto.productVariantId,
      dto.quantity,
    );

    if (!productVariant) {
      throw new NotFoundException(
        'Product not found or not available for sale',
      );
    }

    const cart = await this.repository.findForAdd(userId, productVariant.id);

    const quantity = cart.items[0]?.quantity;

    if (quantity) {
      if (quantity + (dto.quantity || 1) > productVariant.stock) {
        throw new BadRequestException('Not enough stock for product variant');
      }
    }

    await this.repository.addToCart(
      cart.id,
      dto.productVariantId,
      dto.quantity,
    );

    return { success: true, message: 'Product added to cart' };
  }

  async edit(dto: EditCartDto, id: string) {
    const cartItem = await this.repository.getItem(id);

    if (!cartItem) {
      throw new NotFoundException();
    }

    return await this.repository.updateItemQuantity(id, dto.quantity);
  }

  async deleteItem(id: string) {
    const cartItem = await this.repository.getItem(id);

    if (!cartItem) {
      throw new NotFoundException();
    }

    return await this.repository.deleteItem(id);
  }

  async clear(userId: string) {
    const cart = await this.repository.getUserCart(userId);

    if (!cart) {
      return { message: 'Cart already clear', success: true };
    }

    await this.repository.deleteItems(cart.id);

    return { message: 'Cart successfully cleared', success: true };
  }
}
