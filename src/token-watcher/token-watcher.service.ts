import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TickerService } from '../ticker/ticker.service';
import { PositionService } from '../position/position.service';
import { SolanaAmmClientService } from '../solana-client/solana-amm-client.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class TokenWatcherService {
  private readonly logger = new Logger(TokenWatcherService.name);

  private locked = false;

  private solanaAmountPerToken: number;

  public constructor(
    private readonly tickerService: TickerService,
    private readonly positionService: PositionService,
    private readonly solanaClientService: SolanaAmmClientService,
  ) {
    this.solanaAmountPerToken =
      Number(process.env.SOLANA_AMOUNT_PER_TOKEN) || 10000000; // 0.01 SOL
  }

  @Cron('05,15,25,35,45,55 * * * * *')
  public async watch() {
    this.logger.log('Starting the Token Watcher...');
    const startTime = performance.now();

    if (this.locked) {
      this.logger.log(
        `The service ${TokenWatcherService.name} is locked, skipping...`,
      );

      return;
    } else {
      this.locked = true;
    }

    const mints = await this.tickerService.getUniqueTickers();

    for (const mint of mints) {
      try {
        const recentTickers = await this.tickerService.getTickersByMint(
          mint,
          2,
        );

        if (recentTickers.length <= 1) {
          continue;
        }

        const first = recentTickers.shift();
        const last = recentTickers.pop();

        // newly added pool
        if (first.raydiumPool !== last.raydiumPool && first.raydiumPool) {
          const positions = await this.positionService.getByPool(
            first.raydiumPool,
          );

          if (positions.length) {
            this.logger.log(
              `Skipping, since the position has already opened for pool: ${first.raydiumPool}`,
            );
            continue;
          }

          const price = await this.solanaClientService.getPrice(
            first.raydiumPool,
          );
          await this.positionService.create({
            raydiumPool: first.raydiumPool,
            amount: this.solanaAmountPerToken,
            price,
          }); // 0.01 SOL - ~$2

          this.logger.log(`Created a position for ${first.raydiumPool}`);
        }
      } catch (e) {
        Sentry.captureException(e);
        this.logger.error(
          `Something went wrong with the mint: ${mint}. Skipping it. Error: ${e.message}`,
        );
      }
    }

    this.locked = false;

    const endTime = performance.now();
    this.logger.log(
      `Token Watcher is finished! Took: ${Math.round(endTime - startTime)} ms`,
    );
  }
}
