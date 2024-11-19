import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }

  public findById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({
      id,
    });
  }

  public findActiveByUsername(username: string): Promise<User | null> {
    if (!username) {
      return null;
    }

    return this.usersRepository.findOneBy({
      username: username.toLowerCase(),
      subscriptionExpiresAt: MoreThan(new Date()),
    });
  }

  public findActiveUsers(): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        subscriptionExpiresAt: MoreThan(new Date()),
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  public add(params: { username: string; subscriptionExpiresAt: Date }): Promise<User> {
    const user = new User();
    user.username = params.username.toLowerCase();
    user.subscriptionExpiresAt = params.subscriptionExpiresAt;

    return this.usersRepository.save(user);
  }

  public async remove(id: number): Promise<number> {
    const result = await this.usersRepository.delete({ id });

    return result.affected;
  }

  public saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
