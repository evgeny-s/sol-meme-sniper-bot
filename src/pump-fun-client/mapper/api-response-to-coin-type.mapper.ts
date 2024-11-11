import { CoinType } from '../types/coin.type';

export const mapApiResponseToCoinType = ({
  name,
  mint,
  creator,
  associated_bonding_curve,
  bonding_curve,
  market_cap,
  usd_market_cap,
  metadata_uri,
  raydium_pool,
}: any): CoinType => ({
  name,
  associatedBondingCurve: associated_bonding_curve,
  bondingCurve: bonding_curve,
  creator,
  marketCap: market_cap,
  usdMarketCap: usd_market_cap,
  metadataUri: metadata_uri,
  raydiumPool: raydium_pool,
  mint,
});
