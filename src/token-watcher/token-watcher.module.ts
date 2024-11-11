import { Module } from '@nestjs/common';
import { TokenWatcherService } from './token-watcher.service';
import { SolanaClientModule } from '../solana-client/solana-client.module';

@Module({
  providers: [TokenWatcherService],
  imports: [SolanaClientModule],
})
export class TokenWatcherModule {}
