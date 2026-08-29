// QFS Wallet - Global Store (Zustand)
import { create } from 'zustand';
import type { Screen, Token, Transaction, StakingPosition } from '@/types/wallet';
import { loadFromStorage, saveToStorage, removeFromStorage } from '@/lib/wallet/core';

interface WalletStore {
  // Navigation
  currentScreen: Screen;
  previousScreen: Screen | null;
  navigate: (screen: Screen) => void;
  goBack: () => void;

  // Wallet state
  isWalletCreated: boolean;
  isWalletLocked: boolean;
  address: string;
  encryptedPrivateKey: string;
  currentChainId: number;
  balance: string;
  qfsBalance: string;
  qfsPrice: number;

  // Wallet actions
  setWalletCreated: (address: string, encryptedKey: string) => void;
  lockWallet: () => void;
  unlockWallet: () => void;
  setBalance: (balance: string) => void;
  setQfsBalance: (balance: string) => void;
  setQfsPrice: (price: number) => void;
  selectChain: (chainId: number) => void;

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

  // Seed phrase (temporary, for creation flow only)
  tempSeedPhrase: string;
  setTempSeedPhrase: (phrase: string) => void;
  clearTempSeedPhrase: () => void;

  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Settings / Security
  autoLockTimer: number; // seconds, 0 = never
  setAutoLockTimer: (seconds: number) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  hideBalances: boolean;
  setHideBalances: (hide: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Create/Import flow
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;

  // Initialize
  initialize: () => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Navigation
  currentScreen: 'create-wallet',
  previousScreen: null,
  navigate: (screen) => set({ previousScreen: get().currentScreen, currentScreen: screen }),
  goBack: () => {
    const prev = get().previousScreen;
    if (prev) set({ currentScreen: prev, previousScreen: null });
  },

  // Wallet
  isWalletCreated: false,
  isWalletLocked: true,
  address: '',
  encryptedPrivateKey: '',
  currentChainId: 1,
  balance: '0.0000',
  qfsBalance: '0.0000',
  qfsPrice: 0.09,

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

  // Tokens
  tokens: [],
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
  loadTokensForChain: (chainId) => {
    const saved = loadFromStorage<Token[]>('custom_tokens') || [];
    const chainTokens = saved.filter((t) => t.chainId === chainId);
    set({ tokens: chainTokens });
  },

  // Transactions
  transactions: [],
  addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),

  // Staking
  stakingPositions: [],
  addStakingPosition: (pos) => set((s) => ({ stakingPositions: [...s.stakingPositions, pos] })),

  // Seed phrase temp
  tempSeedPhrase: '',
  setTempSeedPhrase: (phrase) => set({ tempSeedPhrase: phrase }),
  clearTempSeedPhrase: () => set({ tempSeedPhrase: '' }),

  // UI
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  toasts: [],
  addToast: (message, type) => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Settings
  autoLockTimer: 300, // 5 min default
  setAutoLockTimer: (seconds) => { saveToStorage('settings_autoLock', seconds); set({ autoLockTimer: seconds }); },
  biometricEnabled: false,
  setBiometricEnabled: (enabled) => { saveToStorage('settings_biometric', enabled); set({ biometricEnabled: enabled }); },
  hideBalances: false,
  setHideBalances: (hide) => { saveToStorage('settings_hideBalances', hide); set({ hideBalances: hide }); },
  darkMode: true,
  toggleDarkMode: () => {
    const next = !get().darkMode;
    saveToStorage('settings_darkMode', next);
    set({ darkMode: next });
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // Onboarding
  showOnboarding: true,
  setShowOnboarding: (show) => set({ showOnboarding: show }),

  // Init
  initialize: () => {
    const created = loadFromStorage<boolean>('wallet_created');
    if (created) {
      const data = loadFromStorage<{ address: string; encryptedKey: string; chainId: number }>('wallet_data');
      if (data) {
        set({
          isWalletCreated: true,
          isWalletLocked: false,
          address: data.address,
          encryptedPrivateKey: data.encryptedKey,
          currentChainId: data.chainId || 1,
          currentScreen: 'dashboard',
          showOnboarding: false,
          autoLockTimer: loadFromStorage<number>('settings_autoLock') ?? 300,
          biometricEnabled: loadFromStorage<boolean>('settings_biometric') ?? false,
          hideBalances: loadFromStorage<boolean>('settings_hideBalances') ?? false,
          darkMode: loadFromStorage<boolean>('settings_darkMode') ?? true,
        });
      }
    }
  },

  resetWallet: () => {
    removeFromStorage('wallet_data');
    removeFromStorage('wallet_created');
    removeFromStorage('tokens');
    removeFromStorage('custom_tokens');
    removeFromStorage('settings_autoLock');
    removeFromStorage('settings_biometric');
    removeFromStorage('settings_hideBalances');
    removeFromStorage('settings_darkMode');
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
      showOnboarding: true,
    });
  },
}));
