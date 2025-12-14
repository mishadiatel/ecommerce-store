import { UserDocument } from '../users/schemas/user.schema';
import { SafeUserDto } from '../users/safe-user.dto';

export const safeUser = (user: UserDocument): SafeUserDto => ({
  _id: String(user._id),
  firstName: user.firstName,
  lastName: user.lastName,
  birthDay: user.birthDay,
  phoneNumber: user.phoneNumber,
  isActivated: user.isActivated,
  email: user.email,
  role: user.role,
});
