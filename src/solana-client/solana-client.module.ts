import { Module } from '@nestjs/common';
import { SolanaClientService } from './solana-client.service';

@Module({
  providers: [SolanaClientService],
  exports: [SolanaClientService],
})
export class SolanaClientModule {}
