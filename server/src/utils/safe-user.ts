import { UserDocument } from '../users/schemas/user.schema';
import { SafeUserDto } from '../users/safe-user.dto';

export const safeUser = (user: UserDocument): SafeUserDto => ({
  _id: String(user._id),
  name: user.name,
  username: user.username,
});
