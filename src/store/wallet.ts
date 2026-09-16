// QFS Wallet — Global Store (Zustand)
import { create } from 'zustand';
import type { Screen, Token, Transaction, StakingPosition, MarketToken } from '@/types/wallet';
import { loadFromStorage, saveToStorage, removeFromStorage } from '@/lib/wallet/core';
import { generateSparkline } from '@/lib/wallet/tokens';

interface WalletStore {
  // Navigation
  currentScreen: Screen;
  previousScreen: Screen | null;
  sidebarOpen: boolean;
  navigate: (screen: Screen) => void;
  goBack: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Wallet state
  isWalletCreated: boolean;
  isWalletLocked: boolean;
  address: string;
  encryptedPrivateKey: string;
  currentChainId: number;
  balance: string;
  qfsBalance: string;
  qfsPrice: number;
  hideBalances: boolean;

  // Wallet actions
  setWalletCreated: (address: string, encryptedKey: string) => void;
  lockWallet: () => void;
  unlockWallet: () => void;
  setBalance: (balance: string) => void;
  setQfsBalance: (balance: string) => void;
  setQfsPrice: (price: number) => void;
  selectChain: (chainId: number) => void;
  toggleHideBalances: () => void;

  // Tokens
  tokens: Token[];
  addToken: (token: Token) => void;
  removeToken: (address: string) => void;
  loadTokensForChain: (chainId: number) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;

  // Staking
  stakingPositions: StakingPosition[];
  addStakingPosition: (pos: StakingPosition) => void;

  // Markets (top tokens global)
  markets: MarketToken[];

  // UI State
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Settings / Security
  autoLockTimer: number;
  setAutoLockTimer: (seconds: number) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;

  // Initialize
  initialize: () => void;
  resetWallet: () => void;
}

// ─── Demo Data (matches screenshot reference) ─────────────────────────
const DEMO_ADDRESS = '0x1A2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D9F4C';

const DEMO_TOKENS: Token[] = [
  {
    symbol: 'QFS',
    name: 'QFS Token',
    address: '0xb5787DA56A4eaF11864696d8B5C6671aDF3449E7',
    decimals: 18,
    balance: '28,452,310.00',
    valueUsd: 25_607_079.00,
    change24h: 12.4,
    chainId: 1,
    color: '#06B6D4',
    sparkline: generateSparkline(28_452_310, 12.4),
  },
  {
    symbol: 'GCRM',
    name: 'Global Currency Restart Master',
    address: '0x11175910c6F02913782777840ac008F30720046f',
    decimals: 18,
    balance: '145,820.00',
    valueUsd: 14_582.00,
    change24h: 8.7,
    chainId: 1,
    color: '#F59E0B',
    sparkline: generateSparkline(145_820, 8.7),
  },
  {
    symbol: 'AlA',
    name: 'AlArab',
    address: '0xF5c068f28eBF91b22e52C2ecD230621879e914B8',
    decimals: 18,
    balance: '62,480.00',
    valueUsd: 18_744.00,
    change24h: 5.3,
    chainId: 1,
    color: '#8B5CF6',
    sparkline: generateSparkline(62_480, 5.3),
  },
  {
    symbol: 'TRAEX',
    name: 'TRAEX Token',
    address: '0xf343cD6836FD14bE86aAE0a2a76c8b0e73E89dD0',
    decimals: 18,
    balance: '18,250.00',
    valueUsd: 5_475.00,
    change24h: -2.4,
    chainId: 1,
    color: '#EC4899',
    sparkline: generateSparkline(18_250, -2.4),
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    balance: '8,932,400.00',
    valueUsd: 8_932_400.00,
    change24h: 0.01,
    chainId: 1,
    color: '#26A17B',
    sparkline: generateSparkline(8_932_400, 0.01),
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    balance: '4,715,200.00',
    valueUsd: 4_715_200.00,
    change24h: -0.02,
    chainId: 1,
    color: '#2775CA',
    sparkline: generateSparkline(4_715_200, -0.02),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0',
    decimals: 18,
    balance: '728.45',
    valueUsd: 2_364_820.00,
    change24h: -1.3,
    chainId: 1,
    color: '#627EEA',
    sparkline: generateSparkline(728.45, -1.3),
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    address: '0x0',
    decimals: 18,
    balance: '2,840.00',
    valueUsd: 1_739_560.00,
    change24h: 2.1,
    chainId: 56,
    color: '#F3BA2F',
    sparkline: generateSparkline(2_840, 2.1),
  },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'receive',
    status: 'confirmed',
    from: '0x4a3B...91c',
    to: '',
    amount: '1,250.00',
    token: 'QFS',
    chain: 'Ethereum',
    timestamp: Date.now() - 1_800_000, // 30 min ago
  },
  {
    id: 'tx-2',
    type: 'send',
    status: 'confirmed',
    from: '',
    to: '0x8f2E...d04',
    amount: '450.00',
    token: 'USDT',
    chain: 'Ethereum',
    timestamp: Date.now() - 7_200_000, // 2h
  },
  {
    id: 'tx-3',
    type: 'swap',
    status: 'confirmed',
    from: '',
    to: '',
    amount: '500.00',
    token: 'ETH → USDC',
    chain: 'Ethereum',
    timestamp: Date.now() - 14_400_000, // 4h
  },
  {
    id: 'tx-4',
    type: 'stake',
    status: 'confirmed',
    from: '',
    to: '',
    amount: '25,000.00',
    token: 'QFS',
    chain: 'Ethereum',
    timestamp: Date.now() - 86_400_000, // 1d
  },
  {
    id: 'tx-5',
    type: 'receive',
    status: 'confirmed',
    from: '0xC19...7af',
    to: '',
    amount: '0.85',
    token: 'ETH',
    chain: 'Ethereum',
    timestamp: Date.now() - 172_800_000, // 2d
  },
];

const DEMO_MARKETS: MarketToken[] = [
  { symbol: 'QFS', name: 'QFS Token', price: 0.91, change24h: 12.4, icon: '/qfs-logo-official.png', color: '#06B6D4' },
  { symbol: 'GCRM', name: 'Global Currency Restart Master', price: 0.10, change24h: 8.7, icon: 'gcrm', color: '#F59E0B' },
  { symbol: 'AlA', name: 'AlArab', price: 0.30, change24h: 5.3, icon: 'ala', color: '#8B5CF6' },
  { symbol: 'TRAEX', name: 'TRAEX Token', price: 0.30, change24h: -2.4, icon: 'traex', color: '#EC4899' },
  { symbol: 'BTC', name: 'Bitcoin', price: 67_240.55, change24h: 2.1, icon: 'btc', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', price: 3_245.67, change24h: -1.3, icon: '/eth-token-logo.png', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', price: 168.42, change24h: 5.7, icon: '/sol-token-logo.png', color: '#9945FF' },
  { symbol: 'BNB', name: 'BNB', price: 612.34, change24h: 0.87, icon: '/bnb-token-logo.png', color: '#F3BA2F' },
];

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Navigation
  currentScreen: 'dashboard',
  previousScreen: null,
  sidebarOpen: false,
  navigate: (screen) => set({ previousScreen: get().currentScreen, currentScreen: screen, sidebarOpen: false }),
  goBack: () => {
    const prev = get().previousScreen;
    if (prev) set({ currentScreen: prev, previousScreen: null });
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Wallet
  isWalletCreated: true, // Demo mode: wallet already exists
  isWalletLocked: false,
  address: DEMO_ADDRESS,
  encryptedPrivateKey: '',
  currentChainId: 1,
  balance: '$42,870,000.00',
  qfsBalance: '28,452,310',
  qfsPrice: 0.91,
  hideBalances: false,

  setWalletCreated: (address, encryptedKey) => {
    saveToStorage('wallet_data', { address, encryptedKey, chainId: get().currentChainId });
    saveToStorage('wallet_created', true);
    set({ isWalletCreated: true, isWalletLocked: false, address, encryptedPrivateKey: encryptedKey, currentScreen: 'dashboard' });
  },
  lockWallet: () => set({ isWalletLocked: true, currentScreen: 'create-wallet' }),
  unlockWallet: () => set({ isWalletLocked: false, currentScreen: 'dashboard' }),

  setBalance: (balance) => set({ balance }),
  setQfsBalance: (qfsBalance) => set({ qfsBalance }),
  setQfsPrice: (qfsPrice) => set({ qfsPrice }),
  selectChain: (chainId) => {
    saveToStorage('wallet_data', { address: get().address, encryptedKey: get().encryptedPrivateKey, chainId });
    set({ currentChainId: chainId });
  },
  toggleHideBalances: () => {
    const next = !get().hideBalances;
    saveToStorage('settings_hideBalances', next);
    set({ hideBalances: next });
  },

  // Tokens
  tokens: DEMO_TOKENS,
  addToken: (token) => set((s) => {
    const exists = s.tokens.find((t) => t.address === token.address && t.chainId === token.chainId);
    if (exists) return s;
    const updated = [...s.tokens, token];
    saveToStorage('custom_tokens', updated);
    return { tokens: updated };
  }),
  removeToken: (address) => set((s) => {
    const updated = s.tokens.filter((t) => t.address !== address);
    saveToStorage('custom_tokens', updated);
    return { tokens: updated };
  }),
  loadTokensForChain: (_chainId) => {
    // For demo, we always show the full demo set
    set({ tokens: DEMO_TOKENS });
  },

  // Transactions
  transactions: DEMO_TRANSACTIONS,
  addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),

  // Staking
  stakingPositions: [
    { poolId: 'qfs-90', amount: 25_000, rewards: 2_580.45, startDate: '2026-08-15', endDate: '2026-11-13', status: 'active' },
  ],
  addStakingPosition: (pos) => set((s) => ({ stakingPositions: [...s.stakingPositions, pos] })),

  // Markets
  markets: DEMO_MARKETS,

  // UI
  toasts: [],
  addToast: (message, type) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Settings
  autoLockTimer: 300,
  setAutoLockTimer: (seconds) => { saveToStorage('settings_autoLock', seconds); set({ autoLockTimer: seconds }); },
  biometricEnabled: false,
  setBiometricEnabled: (enabled) => { saveToStorage('settings_biometric', enabled); set({ biometricEnabled: enabled }); },

  // Init
  initialize: () => {
    // Demo mode: always start with the demo wallet
    set({
      isWalletCreated: true,
      isWalletLocked: false,
      address: DEMO_ADDRESS,
      currentScreen: 'dashboard',
      hideBalances: loadFromStorage<boolean>('settings_hideBalances') ?? false,
      autoLockTimer: loadFromStorage<number>('settings_autoLock') ?? 300,
      biometricEnabled: loadFromStorage<boolean>('settings_biometric') ?? false,
    });
  },

  resetWallet: () => {
    removeFromStorage('wallet_data');
    removeFromStorage('wallet_created');
    removeFromStorage('tokens');
    removeFromStorage('custom_tokens');
    removeFromStorage('settings_autoLock');
    removeFromStorage('settings_biometric');
    removeFromStorage('settings_hideBalances');
    set({
      isWalletCreated: false,
      isWalletLocked: true,
      address: '',
      encryptedPrivateKey: '',
      balance: '0.0000',
      qfsBalance: '0.0000',
      tokens: [],
      transactions: [],
      stakingPositions: [],
      currentScreen: 'create-wallet',
    });
  },
}));

// Derived demo stats used in the dashboard
export const DEMO_STATS = {
  totalAssets: 42_870_000,
  totalAssetsChange: 12.4,
  liquidityPool: 18_450_000,
  liquidityPoolChange: 8.7,
  apy: 12.6,
};
