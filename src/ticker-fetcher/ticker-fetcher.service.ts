import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PumpFunClientService } from '../pump-fun-client/pump-fun-client.service';
import { TickerService } from '../ticker/ticker.service';

@Injectable()
export class TickerFetcherService {
  private readonly logger = new Logger(TickerFetcherService.name);

  public constructor(
    private readonly pumpFunClientService: PumpFunClientService,
    private readonly tickerService: TickerService,
  ) {}

  // @Cron('00,10,20,30,40,50 * * * * *')
  public async run(): Promise<void> {
    this.logger.log('Starting the Ticker Fetcher...');
    const startTime = performance.now();

    const coins = await this.pumpFunClientService.getCoins();

    await this.tickerService.bulkAdd(coins);

    const endTime = performance.now();
    this.logger.log(
      `Ticker Fetcher is finished! Took: ${Math.round(endTime - startTime)} ms`,
    );
  }
}
