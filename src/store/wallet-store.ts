"use client";

import { create } from "zustand";

export type WalletTab = "dashboard" | "send" | "receive" | "swap" | "staking" | "settings";

export interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: "send" | "receive" | "swap" | "stake" | "unstake";
  token: string;
  amount: number;
  usdValue: number;
  address: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface StakingPool {
  id: string;
  token: string;
  apy: number;
  tvl: number;
  staked: number;
  rewards: number;
  lockPeriod: string;
}

interface WalletState {
  activeTab: WalletTab;
  setActiveTab: (tab: WalletTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  selectedToken: string;
  setSelectedToken: (token: string) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  connected: true,
  setConnected: (connected) => set({ connected }),
  walletAddress: "0x7a3b...f92d",
  setWalletAddress: (address) => set({ walletAddress: address }),
  selectedToken: "QFS",
  setSelectedToken: (token) => set({ selectedToken: token }),
}));
