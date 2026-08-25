// GCRM Wallet - Type Definitions

export interface WalletState {
  address: string;
  publicKey: string;
  encryptedPrivateKey: string;
  chain: string;
  balance: string;
  gcrmBalance: string;
  seedPhraseVerified: boolean;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string;
  valueUsd: number;
  chainId: number;
  icon?: string;
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

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'claim';
  status: 'pending' | 'confirmed' | 'failed';
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

export type Screen =
  | 'dashboard'
  | 'wallet'
  | 'swap'
  | 'staking'
  | 'dapps'
  | 'settings'
  | 'create-wallet'
  | 'import-wallet'
  | 'send'
  | 'receive'
  | 'seed-verify'
  | 'transaction-confirm'
  | 'staking-calculator'
  | 'stake-detail'
  | 'networks'
  | 'security'
  | 'dapp-browser'
  | 'token-detail'
  | 'add-token';
