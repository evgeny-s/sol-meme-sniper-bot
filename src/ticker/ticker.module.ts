import { Module } from '@nestjs/common';
import { TickerService } from './ticker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticker } from './ticker.entity';

@Module({
  providers: [TickerService],
  exports: [TickerService],
  imports: [TypeOrmModule.forFeature([Ticker])],
})
export class TickerModule {}
