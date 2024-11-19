import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
import { ApiAuthGuard } from './guards/api-auth.guard';
import { DeleteUserDto } from './dto/delete-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UserModel } from './model/user.model';
import { userEntityToModelMapper } from './mappers/user.mapper';

@Controller('user')
@UseGuards(ApiAuthGuard)
export class UserController {
  public constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Post('')
  @HttpCode(201)
  public create(
    @Body() { username, subscriptionExpiresAt }: UserDto,
  ): Promise<User> {
    return this.usersService.add({ username, subscriptionExpiresAt });
  }

  @Delete(':id')
  @HttpCode(200)
  public delete(@Param() { id }: DeleteUserDto): Promise<number> {
    return this.usersService.remove(id);
  }

  @Get(':id')
  @HttpCode(200)
  public async get(@Param() { id }: GetUserDto): Promise<UserModel> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return userEntityToModelMapper(user);
  }
}
