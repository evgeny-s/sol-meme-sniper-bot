import { Module } from '@nestjs/common';
import { SolanaCpmmClientService } from './solana-cpmm-client.service';
import { SolanaAmmClientService } from './solana-amm-client.service';

@Module({
  providers: [SolanaCpmmClientService, SolanaAmmClientService],
  exports: [SolanaCpmmClientService, SolanaAmmClientService],
})
export class SolanaClientModule {}
