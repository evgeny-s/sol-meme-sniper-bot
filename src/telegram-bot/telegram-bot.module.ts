import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { UserModule } from '../user';
import { TickerModule } from '../ticker/ticker.module';

@Module({
  providers: [TelegramBotService],
  exports: [TelegramBotService],
  controllers: [TelegramBotController],
  imports: [UserModule, TickerModule],
})
export class TelegramBotModule {}
