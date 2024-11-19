import { Inject, Injectable, Logger } from '@nestjs/common';
import { PositionService } from '../position/position.service';
import { StatusEnum } from '../position/enum/status.enum';
import { Cron } from '@nestjs/schedule';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { UsersService } from '../user';
import { SolanaAmmClientService } from '../solana-client/solana-amm-client.service';

@Injectable()
export class PositionProcessorService {
  private readonly logger = new Logger(PositionProcessorService.name);

  private locked = false;

  public constructor(
    private readonly solanaClientService: SolanaAmmClientService,
    private readonly positionService: PositionService,
    @Inject(TelegramBotService)
    private readonly telegramBotService: TelegramBotService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  private async processBuyOperations() {
    const positions = await this.positionService.getByStatus(StatusEnum.NEW);
    const users = await this.usersService.findActiveUsers();

    if (!users.length) {
      this.logger.log('No active users!');

      return;
    }

    if (!positions.length) {
      return;
    }

    for (const position of positions) {
      try {
        await this.solanaClientService.swapToken(
          position.raydiumPool,
          position.amount,
        );

        await this.positionService.updateStatus(position, StatusEnum.PURCHASED);

        await this.telegramBotService.sendMessage(
          users[0].chatId,
          `Swapped the token: ${position.raydiumPool}`,
        );
      } catch (e) {
        this.logger.error(`Something is wrong: ${e.message}`);
      }
    }
  }

  private async processSellOperations() {
    /*
    SELL operation:
      - Fetch all positions with status PURCHASED
      - Check the current price
      - If the price is higher than configured - submit the sell transaction
      - Update the position to SOLD
    */
  }

  @Cron('00,05,10,15,20,25,30,35,40,45,50,55 * * * * *')
  public async run() {
    this.logger.log('Starting the Position Processor...');
    const startTime = performance.now();

    if (this.locked) {
      this.logger.log(
        `The service ${PositionProcessorService.name} is locked, skipping...`,
      );

      return;
    } else {
      this.locked = true;
    }

    await this.processBuyOperations();

    this.locked = false;

    const endTime = performance.now();
    this.logger.log(
      `Position Processor is finished! Took: ${Math.round(endTime - startTime)} ms`,
    );
  }
}
