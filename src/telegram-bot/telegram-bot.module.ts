import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { UserModule } from '../user';

@Module({
  providers: [TelegramBotService],
  exports: [TelegramBotService],
  controllers: [TelegramBotController],
  imports: [UserModule],
})
export class TelegramBotModule {}
