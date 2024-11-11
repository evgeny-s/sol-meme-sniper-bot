import { Module } from '@nestjs/common';
import { TickerFetcherService } from './ticker-fetcher.service';
import { PumpFunClientModule } from '../pump-fun-client/pump-fun-client.module';
import { TickerModule } from '../ticker/ticker.module';

@Module({
  providers: [TickerFetcherService],
  imports: [PumpFunClientModule, TickerModule],
})
export class TickerFetcherModule {}
