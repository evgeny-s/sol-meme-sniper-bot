import { Injectable } from '@nestjs/common';
import { Ticker } from './ticker.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CoinType } from '../pump-fun-client/types/coin.type';

@Injectable()
export class TickerService {
  constructor(
    @InjectRepository(Ticker)
    private tickersRepository: Repository<Ticker>,
  ) {}

  public async bulkAdd(tickerParams: CoinType[]): Promise<void> {
    const tickers = tickerParams.map(
      ({
        name,
        associatedBondingCurve,
        bondingCurve,
        creator,
        marketCap,
        usdMarketCap,
        metadataUri,
        raydiumPool,
        mint,
      }) => {
        const ticker = new Ticker();
        ticker.name = name;
        ticker.associatedBondingCurve = associatedBondingCurve;
        ticker.bondingCurve = bondingCurve;
        ticker.creator = creator;
        ticker.marketCap = marketCap;
        ticker.usdMarketCap = usdMarketCap;
        ticker.metadataUri = metadataUri;
        ticker.raydiumPool = raydiumPool;
        ticker.mint = mint;

        return ticker;
      },
    );

    await this.tickersRepository.insert(tickers);
  }

  public async getUniqueTickers(): Promise<string[]> {
    const result = await this.tickersRepository
      .createQueryBuilder('ticker')
      .distinctOn(['ticker.mint'])
      .getRawMany();

    return result.map((ticker) => ticker.ticker_mint).filter(Boolean);
  }

  public async getTickersByMint(mint: string, limit: number) {
    return await this.tickersRepository.find({
      where: { mint },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
