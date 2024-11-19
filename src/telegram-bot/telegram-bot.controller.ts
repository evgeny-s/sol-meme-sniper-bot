import { Controller, Get, HttpCode, Inject } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';

@Controller('telegram-bot')
export class TelegramBotController {
  public constructor(
    @Inject(TelegramBotService)
    private readonly telegramBotService: TelegramBotService,
  ) {}
}
