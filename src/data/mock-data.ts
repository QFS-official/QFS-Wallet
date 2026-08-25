import { Token, Transaction, StakingPool } from "@/store/wallet-store";

export const tokens: Token[] = [
  { symbol: "QFS", name: "QFS Token", balance: 12500.00, price: 2.47, change24h: 5.32, color: "#10b981", icon: "Q" },
  { symbol: "BTC", name: "Bitcoin", balance: 0.4521, price: 67432.18, change24h: 1.24, color: "#f7931a", icon: "B" },
  { symbol: "ETH", name: "Ethereum", balance: 3.7842, price: 3521.56, change24h: -0.87, color: "#627eea", icon: "E" },
  { symbol: "USDT", name: "Tether", balance: 5420.00, price: 1.00, change24h: 0.01, color: "#26a17b", icon: "T" },
  { symbol: "SOL", name: "Solana", balance: 120.50, price: 178.93, change24h: 3.45, color: "#9945ff", icon: "S" },
  { symbol: "BNB", name: "BNB", balance: 8.25, price: 612.40, change24h: -1.23, color: "#f3ba2f", icon: "N" },
];

export const transactions: Transaction[] = [
  { id: "tx1", type: "receive", token: "QFS", amount: 2500, usdValue: 6175, address: "0x3f4e...8a2b", date: "2026-08-25T10:30:00Z", status: "completed" },
  { id: "tx2", type: "send", token: "ETH", amount: 0.5, usdValue: 1760.78, address: "0x8c1d...4e7f", date: "2026-08-24T18:45:00Z", status: "completed" },
  { id: "tx3", type: "swap", token: "USDT -> QFS", amount: 1000, usdValue: 1000, address: "QFS Swap", date: "2026-08-24T14:20:00Z", status: "completed" },
  { id: "tx4", type: "stake", token: "QFS", amount: 5000, usdValue: 12350, address: "QFS Staking", date: "2026-08-23T09:15:00Z", status: "completed" },
  { id: "tx5", type: "receive", token: "BTC", amount: 0.1, usdValue: 6743.22, address: "0x2b7a...1c9d", date: "2026-08-22T22:00:00Z", status: "completed" },
  { id: "tx6", type: "send", token: "SOL", amount: 25, usdValue: 4473.25, address: "0x5d3f...6b8e", date: "2026-08-22T16:30:00Z", status: "pending" },
  { id: "tx7", type: "unstake", token: "QFS", amount: 2000, usdValue: 4940, address: "QFS Staking", date: "2026-08-21T11:00:00Z", status: "completed" },
  { id: "tx8", type: "swap", token: "ETH -> SOL", amount: 1.0, usdValue: 3521.56, address: "QFS Swap", date: "2026-08-20T08:45:00Z", status: "completed" },
];

export const stakingPools: StakingPool[] = [
  { id: "pool1", token: "QFS", apy: 12.5, tvl: 45000000, staked: 5000, rewards: 156.25, lockPeriod: "30 days" },
  { id: "pool2", token: "ETH", apy: 5.8, tvl: 120000000, staked: 1.5, rewards: 0.024, lockPeriod: "60 days" },
  { id: "pool3", token: "SOL", apy: 8.2, tvl: 35000000, staked: 50, rewards: 0.34, lockPeriod: "Flexible" },
];

export const chartData = [
  { date: "Jul", balance: 42000 },
  { date: "Aug 1", balance: 44500 },
  { date: "Aug 5", balance: 43200 },
  { date: "Aug 10", balance: 47800 },
  { date: "Aug 15", balance: 46100 },
  { date: "Aug 20", balance: 51200 },
  { date: "Aug 25", balance: 53847 },
];

export const allocationData = [
  { name: "QFS", value: 30875, fill: "#10b981" },
  { name: "BTC", value: 30485, fill: "#f7931a" },
  { name: "ETH", value: 13326, fill: "#627eea" },
  { name: "USDT", value: 5420, fill: "#26a17b" },
  { name: "SOL", value: 21560, fill: "#9945ff" },
  { name: "BNB", value: 5052, fill: "#f3ba2f" },
];
