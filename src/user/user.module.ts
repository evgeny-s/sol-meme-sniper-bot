import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
