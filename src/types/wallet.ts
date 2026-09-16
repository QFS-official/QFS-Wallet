// QFS Wallet — Type Definitions

export interface WalletState {
  address: string;
  publicKey: string;
  encryptedPrivateKey: string;
  chain: string;
  balance: string;
  qfsBalance: string;
  seedPhraseVerified: boolean;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string;
  valueUsd: number;
  change24h: number;
  chainId: number;
  icon?: string;
  color?: string;
  sparkline?: number[];
}

export interface ChainConfig {
  id: number;
  name: string;
  symbol: string;
  rpc: string;
  explorer: string;
  icon: string;
  color: string;
  isTestnet: boolean;
}

export interface StakingPool {
  id: string;
  name: string;
  duration: number;
  durationLabel: string;
  apy: number;
  minStake: number;
  maxStake: number;
  totalStaked: number;
  tvl: number;
}

export interface StakingPosition {
  poolId: string;
  amount: number;
  rewards: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'claimed';
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  priceImpact: number;
  slippage: number;
  gasEstimate: string;
  minimumReceived: number;
  route: string[];
}

export type TxType = 'receive' | 'send' | 'swap' | 'stake' | 'unstake' | 'claim';
export type TxStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  type: TxType;
  status: TxStatus;
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: string;
  hash?: string;
  timestamp: number;
  gasFee?: string;
}

export interface DAppConnection {
  id: string;
  name: string;
  domain: string;
  icon: string;
  chainId: number;
  permissions: string[];
  connected: boolean;
  lastUsed: string;
}

export interface MarketToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
  color: string;
}

export type Screen =
  | 'dashboard'
  | 'wallet'
  | 'send'
  | 'receive'
  | 'swap'
  | 'staking'
  | 'dapps'
  | 'settings'
  | 'markets'
  | 'history'
  | 'nfts'
  | 'create-wallet'
  | 'import-wallet'
  | 'seed-verify'
  | 'transaction-confirm'
  | 'staking-calculator'
  | 'stake-detail'
  | 'networks'
  | 'security'
  | 'dapp-browser'
  | 'token-detail'
  | 'add-token';
