import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductService } from '../product/product.service';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Model, Types } from 'mongoose';
import { UpdateCartQtyDto } from './dto/update-qty.dto';
import { FullProductWithTranslations } from '../product/interface/product.interface';

interface VariantSummary {
  sku: string;
  name: string;
  newPrice: number;
  oldPrice?: number;
  stock: number;
  outOfStock: boolean;
  isActive: boolean;
}

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

  /** Знайти варіант у продукті за SKU. */
  private findVariant(
    product: FullProductWithTranslations,
    sku: string | null,
  ): VariantSummary | null {
    if (!sku) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: any[] = (product as any).variants ?? [];
    const v = variants.find((vv) => vv.sku === sku);
    if (!v) return null;
    return {
      sku: v.sku,
      name: v.name || v.attributes?.map((a: { value: string }) => a.value).join(' / ') || v.sku,
      newPrice: v.newPrice,
      oldPrice: v.oldPrice,
      stock: v.stock ?? 0,
      outOfStock: v.outOfStock === true,
      isActive: v.isActive !== false,
    };
  }

  /** Ефективна ціна/залишок з урахуванням варіанту. */
  private effectivePriceAndStock(
    product: FullProductWithTranslations,
    variantSku: string | null,
  ) {
    const variant = this.findVariant(product, variantSku);
    if (variant) {
      return {
        newPrice: variant.newPrice,
        oldPrice: variant.oldPrice ?? variant.newPrice,
        stock: variant.stock,
        outOfStock: variant.outOfStock,
        variantName: variant.name,
        isActive: variant.isActive,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawProduct: any = product;
    return {
      newPrice: product.newPrice,
      oldPrice: product.oldPrice ?? product.newPrice,
      stock: rawProduct.stock ?? 0,
      outOfStock: rawProduct.outOfStock === true,
      variantName: '',
      isActive: true,
    };
  }

  private calculateTotals(
    items: Array<{
      quantity: number;
      product: FullProductWithTranslations;
      variantSku: string | null;
    }>,
  ) {
    let subtotal = 0;
    let discount = 0;

    for (const i of items) {
      const { newPrice, oldPrice } = this.effectivePriceAndStock(
        i.product,
        i.variantSku,
      );
      subtotal += oldPrice * i.quantity;
      discount += (oldPrice - newPrice) * i.quantity;
    }

    return { subtotal, discount, total: subtotal - discount };
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
    const products =
      await this.productService.findPublicProductsByIdsArray(ids);

    // Формуємо позиції корзини з підтягнутими даними продуктів + варіантів
    const items = cart.items
      .map((i) => {
        const product = products.find(
          (p) => String(p._id) === i.productId.toString(),
        );
        if (!product) return null;
        const info = this.effectivePriceAndStock(product, i.variantSku ?? null);
        return {
          product,
          variantSku: i.variantSku ?? null,
          variantName: info.variantName,
          effectivePrice: info.newPrice,
          effectiveOldPrice: info.oldPrice,
          availableStock: info.stock,
          outOfStock: info.outOfStock,
          quantity: i.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const totals = this.calculateTotals(items);

    return {
      items,
      ...totals,
    };
  }

  async addItem(user: JwtUser | null, dto: AddToCartDto) {
    const cart = await this.findOrCreateCart(user, dto.guestId);

    // Перевіряємо, чи товар потребує варіант
    const [product] = await this.productService.findPublicProductsByIdsArray([
      dto.productId,
    ]);
    if (!product) throw new BadRequestException('Product not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasVariants = Array.isArray((product as any).variants) && (product as any).variants.length > 0;
    if (hasVariants && !dto.variantSku) {
      throw new BadRequestException('variantSku is required for this product');
    }
    if (hasVariants && !this.findVariant(product, dto.variantSku ?? null)) {
      throw new BadRequestException('Variant not found');
    }
    const info = this.effectivePriceAndStock(product, dto.variantSku ?? null);

    // Єдина перевірка — прапорець outOfStock. Кількість (stock) — суто
    // інформаційне поле і не обмежує додавання в кошик.
    if (info.outOfStock) {
      throw new BadRequestException('Product is out of stock');
    }

    const variantSku = dto.variantSku ?? null;
    const index = cart.items.findIndex(
      (i) =>
        i.productId.toString() === dto.productId &&
        (i.variantSku ?? null) === variantSku,
    );

    if (index >= 0) {
      cart.items[index].quantity += dto.quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(dto.productId),
        quantity: dto.quantity,
        variantSku,
      });
    }

    await cart.save();

    return this.getCart(user, dto.guestId);
  }

  async updateQty(user: JwtUser | null, dto: UpdateCartQtyDto) {
    const cart = await this.findOrCreateCart(user, dto.guestId);

    const variantSku = dto.variantSku ?? null;
    cart.items = cart.items
      .map((i) =>
        i.productId.toString() === dto.productId &&
        (i.variantSku ?? null) === variantSku
          ? { ...i, quantity: dto.quantity, variantSku: i.variantSku ?? null }
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
    variantSku?: string | null,
  ) {
    const cart = await this.findOrCreateCart(user, guestId);
    const skuFilter = variantSku ?? null;

    cart.items = cart.items.filter((i) => {
      const same =
        i.productId.toString() === productId &&
        (i.variantSku ?? null) === skuFilter;
      return !same;
    });

    await cart.save();

    return this.getCart(user, guestId);
  }
}
