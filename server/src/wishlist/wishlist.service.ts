import { Injectable } from '@nestjs/common';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private wishlistModel: Model<WishlistDocument>,
  ) {}
  async getOrCreate(userId: string) {
    let wishlist = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!wishlist) {
      wishlist = await this.wishlistModel.create({
        userId: new Types.ObjectId(userId),
        productIds: [],
      });
    }
    return wishlist;
  }

  async add(userId: string, productId: string) {
    return this.wishlistModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $addToSet: { productIds: new Types.ObjectId(productId) } },
      { new: true, upsert: true },
    );
  }

  async remove(userId: string, productId: string) {
    return this.wishlistModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $pull: { productIds: new Types.ObjectId(productId) } },
      { new: true },
    );
  }

  async clear(userId: string) {
    return this.wishlistModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $set: { productIds: [] } },
    );
  }
}
