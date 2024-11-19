import { UserModel } from '../model/user.model';
import { User } from '../user.entity';

export const userEntityToModelMapper = ({ id, username, createdAt, updatedAt, chatId }: User): UserModel => {
  const now = new Date();

  return {
    id,
    username,
    chatId,
    createdAt: `${createdAt.toString()} (${Math.round((now.getTime() - createdAt.getTime()) / 1000)}) seconds ago)`,
    updatedAt: updatedAt.toString(),
  };
};
