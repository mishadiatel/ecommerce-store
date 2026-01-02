import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
}
