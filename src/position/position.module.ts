import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './position.entity';

@Module({
  providers: [PositionService],
  exports: [PositionService],
  imports: [TypeOrmModule.forFeature([Position])],
})
export class PositionModule {}
