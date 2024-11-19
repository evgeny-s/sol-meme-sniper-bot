import { Module } from '@nestjs/common';
import { PositionProcessorService } from './position-processor.service';
import { SolanaClientModule } from '../solana-client/solana-client.module';
import { PositionModule } from '../position/position.module';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';
import { UserModule } from '../user';

@Module({
  providers: [PositionProcessorService],
  imports: [SolanaClientModule, PositionModule, TelegramBotModule, UserModule],
})
export class PositionProcessorModule {}
