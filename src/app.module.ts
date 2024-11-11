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
      entities: [Ticker],
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
    PumpFunClientModule,
    SolanaClientModule,
    TokenWatcherModule,
  ],
})
export class AppModule {}
