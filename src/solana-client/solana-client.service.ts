import {
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  CpmmRpcData,
  CurveCalculator,
  Raydium,
  CREATE_CPMM_POOL_PROGRAM,
  DEV_CREATE_CPMM_POOL_PROGRAM,
} from '@raydium-io/raydium-sdk-v2';
import * as BN from 'bn.js';
import { NATIVE_MINT } from '@solana/spl-token';

import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SolanaClientService {
  private readonly logger = new Logger(SolanaClientService.name);

  private raydium: Raydium;

  connection: Connection;

  owner: Keypair;

  public constructor() {
    this.connection = new Connection(process.env.RPC_URL);
    this.owner = Keypair.fromSecretKey(
      bs58.decode(process.env.WALLET_PRIVATE_KEY),
    );
  }

  private async initSdk(params?: { loadToken?: boolean }) {
    const cluster = 'mainnet';

    if (this.raydium) {
      return;
    }
    if (this.connection.rpcEndpoint === clusterApiUrl('mainnet-beta')) {
      this.logger.warn(
        'using free rpc node might cause unexpected error, strongly suggest uses paid rpc node',
      );
    }

    this.logger.log(
      `connect to rpc ${this.connection.rpcEndpoint} in ${cluster}`,
    );

    this.raydium = await Raydium.load({
      owner: this.owner,
      connection: this.connection,
      cluster,
      disableFeatureCheck: true,
      disableLoadToken: !params?.loadToken,
      blockhashCommitment: 'finalized',
    });
  }

  public async swapToken(
    poolId: string,
    amountIn: number,
    inputMint: string = NATIVE_MINT.toBase58(),
  ): Promise<string> {
    await this.initSdk();

    const inputAmount = new BN(amountIn);

    let poolInfo: ApiV3PoolInfoStandardItemCpmm;
    let poolKeys: CpmmKeys | undefined;
    let rpcData: CpmmRpcData;

    if (this.raydium.cluster === 'mainnet') {
      const data = await this.raydium.api.fetchPoolById({ ids: poolId });
      poolInfo = data[0] as ApiV3PoolInfoStandardItemCpmm;
      if (!this.isValidCpmm(poolInfo.programId))
        throw new Error('target pool is not CPMM pool');
      rpcData = await this.raydium.cpmm.getRpcPoolInfo(poolInfo.id, true);
    }

    if (
      inputMint !== poolInfo.mintA.address &&
      inputMint !== poolInfo.mintB.address
    ) {
      throw new Error('input mint does not match pool');
    }

    const baseIn = inputMint === poolInfo.mintA.address;

    const swapResult = CurveCalculator.swap(
      inputAmount,
      baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
      baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
      rpcData.configInfo!.tradeFeeRate,
    );

    const { execute } = await this.raydium.cpmm.swap({
      poolInfo,
      poolKeys,
      inputAmount,
      swapResult,
      slippage: 0.01, // range: 1 ~ 0.0001, means 100% ~ 0.01%
      baseIn,
      computeBudgetConfig: {
        units: 60000,
        microLamports: 20000000,
      },
    });

    const { txId } = await execute({ sendAndConfirm: true });
    this.logger.log(
      `swapped: ${poolInfo.mintA.symbol} to ${poolInfo.mintB.symbol}: ${`https://explorer.solana.com/tx/${txId}`}`,
    );

    return txId;
  }

  private isValidCpmm(id: string): boolean {
    const VALID_PROGRAM_ID = new Set([
      CREATE_CPMM_POOL_PROGRAM.toBase58(),
      DEV_CREATE_CPMM_POOL_PROGRAM.toBase58(),
    ]);

    return VALID_PROGRAM_ID.has(id);
  }
}
