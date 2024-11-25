import { Injectable, Logger } from '@nestjs/common';
import { PumpFunClientService } from '../pump-fun-client/pump-fun-client.service';
import { TickerService } from '../ticker/ticker.service';
import { Cron } from '@nestjs/schedule';

const HISTORY_TIME_RANGE_SECONDS = 3600;

@Injectable()
export class TickerFetcherService {
  private readonly logger = new Logger(TickerFetcherService.name);

  private locked = false;

  public constructor(
    private readonly pumpFunClientService: PumpFunClientService,
    private readonly tickerService: TickerService,
  ) {}

  @Cron('00,10,20,30,40,50 * * * * *')
  public async run(): Promise<void> {
    this.logger.log('Starting the Ticker Fetcher...');
    const startTime = performance.now();

    if (this.locked) {
      this.logger.log(
        `The service ${TickerFetcherService.name} is locked, skipping...`,
      );

      return;
    } else {
      this.locked = true;
    }

    try {
      const coins = await this.pumpFunClientService.getCoins();

      await this.tickerService.bulkAdd(coins);
    } catch (e) {
      this.logger.error(`Something went wrong. Error: ${e.message}`);
    }

    this.locked = false;

    const endTime = performance.now();
    this.logger.log(
      `Ticker Fetcher is finished! Took: ${Math.round(endTime - startTime)} ms`,
    );
  }

  @Cron('30 * * * * *')
  public async cleanUpRun(): Promise<void> {
    try {
      this.logger.log('Starting the cleanup...');
      const affected = await this.tickerService.removeOlderThenDate(
        Date.now() - HISTORY_TIME_RANGE_SECONDS * 1000,
      );

      this.logger.log(`Cleanup is finished. Affected: ${affected}`);
    } catch (e: any) {
      this.logger.error(e.message);
      throw e;
    }
  }
}
