import { Module } from '@nestjs/common';
import { TickerFetcherModule } from './ticker-fetcher/ticker-fetcher.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TickerModule } from './ticker/ticker.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticker } from './ticker/ticker.entity';
import { LoggerOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { PumpFunClientModule } from './pump-fun-client/pump-fun-client.module';
import { SolanaClientModule } from './solana-client/solana-client.module';
import { TokenWatcherModule } from './token-watcher/token-watcher.module';
import { PositionModule } from './position/position.module';
import { PositionProcessorModule } from './position-processor/position-processor.module';
import { UserModule, UsersService } from './user';
import { User } from './user/user.entity';
import { TelegrafModule, TelegrafModuleAsyncOptions } from 'nestjs-telegraf';
import { NO_ACCESS_MESSAGE } from './telegram-bot/telegram-bot.service';
import * as LocalSession from 'telegraf-session-local';
import { Position } from './position/position.entity';

const sessions = new LocalSession({
  database: './bot_session_db.json',
});

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TickerFetcherModule,
    TickerModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      entities: [Ticker, User, Position],
      synchronize: true,
      extra: {
        ssl:
          process.env.PG_SSL === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : false,
      },
      logging: (process.env.PG_LOG_LEVEL as LoggerOptions) || ['error'],
    }),
    TelegrafModule.forRootAsync({
      useFactory: (usersService: UsersService) => {
        return {
          token: process.env.TELEGRAM_BOT_TOKEN,
          middlewares: [
            sessions.middleware(),
            async (ctx, next) => {
              const request = ctx.update.message || ctx.update.callback_query;
              const username = request.from.username;

              const user = await usersService.findActiveByUsername(username);
              if (!user) {
                ctx.reply(NO_ACCESS_MESSAGE);
              }

              return next();
            },
          ],
        };
      },
      inject: [UsersService],
      imports: [UserModule],
    } as TelegrafModuleAsyncOptions),
    PumpFunClientModule,
    SolanaClientModule,
    TokenWatcherModule,
    PositionModule,
    PositionProcessorModule,
    UserModule,
  ],
})
export class AppModule {}
