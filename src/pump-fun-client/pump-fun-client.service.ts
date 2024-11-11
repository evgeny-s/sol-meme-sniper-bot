import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios/index';
import { CoinType } from './types/coin.type';
import { mapApiResponseToCoinType } from './mapper/api-response-to-coin-type.mapper';

@Injectable()
export class PumpFunClientService {
  private readonly logger = new Logger(PumpFunClientService.name);

  private baseUrl: string;

  public constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.PUMP_FUN_URL;
  }

  public async getCoins() {
    const limit = 100;
    let offset = 0;
    let empty = false;
    const result: CoinType[] = [];

    while (!empty) {
      const coins = await this.sendRequest(
        `/coins/for-you?offset=${offset}&limit=${limit}&includeNsfw=false`,
      );
      if (coins.length === 0) {
        empty = true;
      }

      offset += limit;

      await this.delay();

      result.push(...coins.map(mapApiResponseToCoinType));
    }

    return result;
  }

  private delay(ms: number = 1000) {
    return new Promise<void>((res) => {
      return setTimeout(() => {
        res();
      }, ms);
    });
  }

  private async sendRequest(url): Promise<unknown[]> {
    const config: AxiosRequestConfig = {
      baseURL: this.baseUrl,
      method: 'GET',
      url,
    } as unknown as AxiosRequestConfig;

    let result: AxiosResponse;
    try {
      this.logger.log(`About to send the request with params: url=${url}`);
      result = await this.httpService.request(config).toPromise();
    } catch (e) {
      console.log(e);

      this.logger.log('Request error:');

      throw e;
    }

    return result.data;
  }
}
