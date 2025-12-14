import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { AuthDto } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: AuthDto) {
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
    return this.userModel.findById(id).select('+password +refreshToken');
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailFullFields(email: string) {
    return this.userModel.findOne({ email }).select('+password +refreshToken');
  }

  async findByResetToken(token: string) {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      })
      .select('+password +refreshToken');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
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
