import { Injectable } from '@nestjs/common';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductService } from '../product/product.service';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Model, Types } from 'mongoose';
import { UpdateCartQtyDto } from './dto/update-qty.dto';
import { FullProductWithTranslations } from '../product/interface/product.interface';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productService: ProductService,
  ) {}

  private async findOrCreateCart(user: JwtUser | null, guestId?: string) {
    const query = user ? { userId: new Types.ObjectId(user.sub) } : { guestId };

    let cart = await this.cartModel.findOne(query);

    if (!cart) {
      cart = await this.cartModel.create({
        userId: user?.sub ? new Types.ObjectId(user.sub) : null,
        guestId: user ? null : guestId,
        items: [],
      });
    }

    return cart;
  }

  private calculateTotals(
    items: Array<{ quantity: number; product: FullProductWithTranslations }>,
  ) {
    let subtotal = 0;
    let discount = 0;

    for (const i of items) {
      const price = i.product.newPrice;
      const old = i.product.oldPrice ?? price;

      subtotal += old * i.quantity;
      discount += (old - price) * i.quantity;
    }

    const total = subtotal - discount;

    return { subtotal, discount, total };
  }

  async getCart(user: JwtUser | null, guestId: string | undefined) {
    const cart = await this.findOrCreateCart(user, guestId);

    if (!cart.items.length) {
      return {
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      };
    }

    const ids = cart.items.map((i) => i.productId.toString());
    // console.log('ids', ids);

    const products =
      await this.productService.findPublicProductsByIdsArray(ids);
    // console.log(products);

    const items: Array<{
      quantity: number;
      product: FullProductWithTranslations;
    }> = cart.items.map((i) => ({
      product: products.find((p) => String(p._id) === i.productId.toString())!,
      quantity: i.quantity,
    }));

    const totals = this.calculateTotals(items);

    return {
      items,
      ...totals,
    };
  }

  async addItem(user: JwtUser | null, dto: AddToCartDto) {
    const cart = await this.findOrCreateCart(user, dto.guestId);

    const index = cart.items.findIndex(
      (i) => i.productId.toString() === dto.productId,
    );

    if (index >= 0) {
      cart.items[index].quantity += dto.quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(dto.productId),
        quantity: dto.quantity,
      });
    }

    await cart.save();

    return this.getCart(user, dto.guestId);
  }

  async updateQty(user: JwtUser | null, dto: UpdateCartQtyDto) {
    const cart = await this.findOrCreateCart(user, dto.guestId);

    cart.items = cart.items
      .map((i) =>
        i.productId.toString() === dto.productId
          ? { ...i, quantity: dto.quantity }
          : i,
      )
      .filter((i) => i.quantity > 0);

    await cart.save();

    return this.getCart(user, dto.guestId);
  }

  async removeItem(
    user: JwtUser | null,
    productId: string,
    guestId: string | undefined,
  ) {
    const cart = await this.findOrCreateCart(user, guestId);

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);

    await cart.save();

    return this.getCart(user, guestId);
  }
}
