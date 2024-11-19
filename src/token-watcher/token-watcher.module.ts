import { Module } from '@nestjs/common';
import { TokenWatcherService } from './token-watcher.service';
import { SolanaClientModule } from '../solana-client/solana-client.module';
import { TickerModule } from '../ticker/ticker.module';
import { PositionModule } from '../position/position.module';

@Module({
  providers: [TokenWatcherService],
  imports: [SolanaClientModule, TickerModule, PositionModule],
})
export class TokenWatcherModule {}
