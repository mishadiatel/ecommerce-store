import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Order, OrderDocument } from '../order/schema/order.schema';
import { ProductService } from '../product/product.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productService: ProductService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll() {
    return this.userModel.find().exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findByIdFullFields(id: string) {
    return this.userModel
      .findById(id)
      .select(
        '+password +sessions +passwordChangedAt +passwordResetToken +passwordResetExpires +activationToken',
      );
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailFullFields(email: string) {
    return this.userModel
      .findOne({ email })
      .select(
        '+password +sessions +passwordChangedAt +passwordResetToken +passwordResetExpires +activationToken',
      );
  }

  async findByResetToken(token: string) {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      })
      .select(
        '+password +sessions +passwordChangedAt +passwordResetToken +passwordResetExpires +activationToken',
      );
  }

  async findByActivationToken(activationToken: string) {
    return this.userModel
      .findOne({ activationToken })
      .select(
        '+password +sessions +passwordChangedAt +passwordResetToken +passwordResetExpires +activationToken',
      );
  }

  async update(id: string, updateUserDto: FilterQuery<UserDocument>) {
    const updateBody = { ...updateUserDto };
    if (updateUserDto.password) {
      updateBody.password = await bcrypt.hash(updateUserDto.password, 12);
    }
    return this.userModel
      .findByIdAndUpdate(id, updateBody, { new: true, runValidators: true })
      .exec();
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  // ─── Admin: список користувачів з інфо про корзину/замовлення ────────────────

  /**
   * Пагінований список користувачів з полем hasAbandonedCart (є непорожня корзина)
   * і кількістю замовлень.
   */
  async findAllAdmin(params: {
    page?: string | number;
    limit?: string | number;
    search?: string;
    hasAbandonedCart?: string | boolean;
  }) {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 25;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<UserDocument> = {};
    if (params.search) {
      const safe = params.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { email: { $regex: safe, $options: 'i' } },
        { firstName: { $regex: safe, $options: 'i' } },
        { lastName: { $regex: safe, $options: 'i' } },
        { phoneNumber: { $regex: safe, $options: 'i' } },
      ];
    }

    const [users, totalDocuments] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);

    // Одним запитом дізнаємось у кого є непорожня корзина
    const cartsAgg = await this.cartModel.aggregate<{
      _id: Types.ObjectId;
      itemsCount: number;
    }>([
      { $match: { userId: { $in: userIds } } },
      {
        $project: {
          userId: 1,
          itemsCount: {
            $sum: {
              $map: {
                input: '$items',
                as: 'i',
                in: '$$i.quantity',
              },
            },
          },
        },
      },
      { $match: { itemsCount: { $gt: 0 } } },
      {
        $group: {
          _id: '$userId',
          itemsCount: { $sum: '$itemsCount' },
        },
      },
    ]);

    const cartByUser = new Map<string, number>();
    for (const c of cartsAgg) cartByUser.set(String(c._id), c.itemsCount);

    // Одним запитом — кількість замовлень і сума
    const ordersAgg = await this.orderModel.aggregate<{
      _id: Types.ObjectId;
      ordersCount: number;
      totalSpent: number;
    }>([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
        },
      },
    ]);
    const ordersByUser = new Map<
      string,
      { ordersCount: number; totalSpent: number }
    >();
    for (const o of ordersAgg) {
      ordersByUser.set(String(o._id), {
        ordersCount: o.ordersCount,
        totalSpent: o.totalSpent,
      });
    }

    let data = users.map((u) => {
      const cartItems = cartByUser.get(String(u._id)) ?? 0;
      const orderInfo = ordersByUser.get(String(u._id)) ?? {
        ordersCount: 0,
        totalSpent: 0,
      };
      return {
        _id: String(u._id),
        email: u.email,
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        phoneNumber: u.phoneNumber ?? null,
        role: u.role,
        isActivated: u.isActivated,
        hasAbandonedCart: cartItems > 0,
        cartItemsCount: cartItems,
        ordersCount: orderInfo.ordersCount,
        totalSpent: Math.round(orderInfo.totalSpent * 100) / 100,
      };
    });

    // Фільтр після join'у: тільки з покинутою корзиною
    if (
      params.hasAbandonedCart === true ||
      params.hasAbandonedCart === 'true'
    ) {
      data = data.filter((u) => u.hasAbandonedCart);
    }

    return {
      data,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      page,
      limit,
    };
  }

  /**
   * Повна інформація про користувача для адміна:
   *  - профіль
   *  - усі його замовлення (від нових до старих)
   *  - поточна корзина (з product-даними)
   */
  async findUserDetailsAdmin(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');

    const userObjectId = new Types.ObjectId(id);

    const [orders, cart, ordersSummaryAgg] = await Promise.all([
      this.orderModel
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .lean(),
      this.cartModel.findOne({ userId: userObjectId }).lean(),
      this.orderModel.aggregate<{
        totalOrders: number;
        totalRevenue: number;
        paidRevenue: number;
      }>([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            paidRevenue: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
              },
            },
          },
        },
      ]),
    ]);

    // Розшифровуємо продукти в корзині
    let cartWithProducts: {
      items: Array<{ productId: string; quantity: number; name: string | null; price: number | null; image: string | null }>;
      totalQuantity: number;
      estimatedTotal: number;
    } | null = null;

    if (cart && cart.items.length > 0) {
      const ids = cart.items.map((i) => i.productId.toString());
      const products =
        await this.productService.findPublicProductsByIdsArray(ids);

      const items = cart.items.map((i) => {
        const p = products.find(
          (pp) => String(pp._id) === i.productId.toString(),
        );
        const uaTr = p?.translations?.find((t) => t.lang === 'ua');
        const anyTr = p?.translations?.[0];
        return {
          productId: i.productId.toString(),
          quantity: i.quantity,
          name: uaTr?.title ?? anyTr?.title ?? p?.slug ?? null,
          price: p?.newPrice ?? null,
          image: p?.images?.[0] ?? null,
        };
      });
      const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
      const estimatedTotal = items.reduce(
        (s, i) => s + (i.price ?? 0) * i.quantity,
        0,
      );

      cartWithProducts = {
        items,
        totalQuantity,
        estimatedTotal: Math.round(estimatedTotal * 100) / 100,
      };
    }

    const summary = ordersSummaryAgg[0] ?? {
      totalOrders: 0,
      totalRevenue: 0,
      paidRevenue: 0,
    };

    return {
      user: {
        _id: String(user._id),
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        phoneNumber: user.phoneNumber ?? null,
        birthDay: user.birthDay ?? null,
        role: user.role,
        isActivated: user.isActivated,
      },
      cart: cartWithProducts,
      orders,
      ordersSummary: {
        totalOrders: summary.totalOrders,
        totalRevenue: Math.round(summary.totalRevenue * 100) / 100,
        paidRevenue: Math.round(summary.paidRevenue * 100) / 100,
      },
    };
  }
}
