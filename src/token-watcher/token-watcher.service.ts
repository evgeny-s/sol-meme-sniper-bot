import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SolanaClientService } from '../solana-client/solana-client.service';

@Injectable()
export class TokenWatcherService {
  private readonly logger = new Logger(TokenWatcherService.name);

  public constructor(
    private readonly solanaClientService: SolanaClientService,
  ) {}

  // @Cron('05 * * * * *')
  public async watch() {
    this.logger.log('Starting the Token Watcher...');
    const startTime = performance.now();

    const tx = await this.solanaClientService.swapToken(
      '7JuwJuNU88gurFnyWeiyGKbFmExMWcmRZntn9imEzdny',
      6,
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    );

    this.logger.log('Transaction: ', tx);

    const endTime = performance.now();
    this.logger.log(
      `Token Watcher is finished! Took: ${Math.round(endTime - startTime)} ms`,
    );
  }
}
