import {
  ApiV3PoolInfoStandardItemCpmm,
  Raydium,
  AmmRpcData,
  ApiV3PoolInfoStandardItem,
  AmmV4Keys,
  AMM_STABLE,
  AMM_V4,
} from '@raydium-io/raydium-sdk-v2';
import * as BN from 'bn.js';
import { NATIVE_MINT } from '@solana/spl-token';

import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SolanaAmmClientService {
  private readonly logger = new Logger(SolanaAmmClientService.name);

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

  public async getPrice(poolId: string): Promise<number> {
    await this.initSdk();

    const data = await this.raydium.api.fetchPoolById({ ids: poolId });
    const poolInfo = data[0] as ApiV3PoolInfoStandardItem;

    if (!poolInfo) {
      throw new Error('Pool Info is empty');
    }

    return poolInfo.price;
  }

  public async swapToken(
    poolId: string,
    amountIn: number,
    inputMint: string = NATIVE_MINT.toBase58(),
  ): Promise<string> {
    await this.initSdk();

    let poolInfo: ApiV3PoolInfoStandardItem | undefined;
    let poolKeys: AmmV4Keys | undefined;
    let rpcData: AmmRpcData;

    if (this.raydium.cluster === 'mainnet') {
      const data = await this.raydium.api.fetchPoolById({ ids: poolId });
      poolInfo = data[0] as ApiV3PoolInfoStandardItem;
      if (!this.isValidAmm(poolInfo.programId))
        throw new Error('target pool is not AMM pool');
      poolKeys = await this.raydium.liquidity.getAmmPoolKeys(poolId);
      rpcData = await this.raydium.liquidity.getRpcPoolInfo(poolId);
    }

    const [baseReserve, quoteReserve, status] = [
      rpcData.baseReserve,
      rpcData.quoteReserve,
      rpcData.status.toNumber(),
    ];

    if (
      poolInfo.mintA.address !== inputMint &&
      poolInfo.mintB.address !== inputMint
    )
      throw new Error('input mint does not match pool');

    const baseIn = inputMint === poolInfo.mintA.address;
    const [mintIn, mintOut] = baseIn
      ? [poolInfo.mintA, poolInfo.mintB]
      : [poolInfo.mintB, poolInfo.mintA];

    const out = this.raydium.liquidity.computeAmountOut({
      poolInfo: {
        ...poolInfo,
        baseReserve,
        quoteReserve,
        status,
        version: 4,
      },
      amountIn: new BN(amountIn),
      mintIn: mintIn.address,
      mintOut: mintOut.address,
      slippage: 0.01, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    });

    const { execute } = await this.raydium.liquidity.swap({
      poolInfo,
      poolKeys,
      amountIn: new BN(amountIn),
      amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
      fixedSide: 'in',
      inputMint: mintIn.address,
      computeBudgetConfig: {
        units: 100000,
        microLamports: 50000000,
      },
    });

    const { txId } = await execute({ sendAndConfirm: true });
    this.logger.log(
      `swapped: ${poolInfo.mintA.symbol} to ${poolInfo.mintB.symbol}: ${`https://explorer.solana.com/tx/${txId}`}`,
    );

    return txId;
  }

  private isValidAmm(id: string): boolean {
    const VALID_PROGRAM_ID = new Set([
      AMM_V4.toBase58(),
      AMM_STABLE.toBase58(),
    ]);

    return VALID_PROGRAM_ID.has(id);
  }
}
