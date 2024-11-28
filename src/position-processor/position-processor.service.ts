import { Inject, Injectable, Logger } from '@nestjs/common';
import { PositionService } from '../position/position.service';
import { StatusEnum } from '../position/enum/status.enum';
import { Cron } from '@nestjs/schedule';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { UsersService } from '../user';
import { SolanaAmmClientService } from '../solana-client/solana-amm-client.service';
import { User } from '../user/user.entity';
import * as Sentry from '@sentry/node';

@Injectable()
export class PositionProcessorService {
  private readonly logger = new Logger(PositionProcessorService.name);

  private locked = false;

  private sellRatio: number;

  public constructor(
    private readonly solanaClientService: SolanaAmmClientService,
    private readonly positionService: PositionService,
    @Inject(TelegramBotService)
    private readonly telegramBotService: TelegramBotService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    this.sellRatio = Number(process.env.TOKEN_SELL_RATION) || 5;
  }

  private async processBuyOperations(user: User) {
    const positions = await this.positionService.getByStatus(StatusEnum.NEW);

    if (!positions.length) {
      return;
    }

    for (const position of positions) {
      try {
        await this.telegramBotService.sendMessage(
          user.chatId,
          `Trying to purchase the token for pool: ${position.raydiumPool}`,
        );

        await this.solanaClientService.buy(
          position.raydiumPool,
          position.amount,
        );

        await this.positionService.updateStatus(position, StatusEnum.PURCHASED);

        await this.telegramBotService.sendMessage(
          user.chatId,
          `Purchased the token: ${position.raydiumPool}`,
        );
      } catch (e) {
        await this.positionService.updateStatus(position, StatusEnum.FAILED);
        Sentry.captureException(e);
        this.logger.error(`Something is wrong: ${e.message}`);
      }
    }
  }

  private async processSellOperations(user: User) {
    const positions = await this.positionService.getByStatus(
      StatusEnum.PURCHASED,
    );

    if (!positions.length) {
      return;
    }

    for (const position of positions) {
      try {
        const price = await this.solanaClientService.getPrice(
          position.raydiumPool,
        );

        if (price / position.price > this.sellRatio) {
          await this.telegramBotService.sendMessage(
            user.chatId,
            `Trying to sell the token for pool: ${position.raydiumPool}`,
          );

          await this.solanaClientService.sell(position.raydiumPool);
        }

        await this.positionService.updateStatus(position, StatusEnum.SOLD);

        await this.telegramBotService.sendMessage(
          user.chatId,
          `Sold the token: ${position.raydiumPool}`,
        );
      } catch (e) {
        Sentry.captureException(e);
        this.logger.error(`Something is wrong: ${e.message}`);
      }
    }

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

    const users = await this.usersService.findActiveUsers();

    if (!users.length) {
      this.logger.log('No active users!');

      return;
    }

    await this.processBuyOperations(users[0]);

    await this.processSellOperations(users[0]);

    this.locked = false;

    const endTime = performance.now();
    this.logger.log(
      `Position Processor is finished! Took: ${Math.round(endTime - startTime)} ms`,
    );
  }
}
