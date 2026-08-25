// QFS Wallet - Staking Pool Configurations
import type { StakingPool } from '@/types/wallet';

export const STAKING_POOLS: StakingPool[] = [
  {
    id: 'qfs-90',
    name: 'QFS 90 Days',
    duration: 90,
    durationLabel: '90 days',
    apy: 42.23,
    minStake: 100,
    maxStake: 10000000,
    totalStaked: 45230000,
    tvl: 4070700,
  },
  {
    id: 'qfs-30',
    name: 'QFS 30 Days',
    duration: 30,
    durationLabel: '30 days',
    apy: 28.67,
    minStake: 50,
    maxStake: 5000000,
    totalStaked: 22150000,
    tvl: 1993500,
  },
  {
    id: 'qfs-flexible',
    name: 'QFS Flexible',
    duration: 0,
    durationLabel: 'Flexible',
    apy: 15.25,
    minStake: 10,
    maxStake: 1000000,
    totalStaked: 8900000,
    tvl: 801000,
  },
];

export function calculateStakingRewards(amount: number, apy: number, days: number): number {
  return amount * (apy / 100) * (days / 365);
}

export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

export function formatTVL(tvl: number): string {
  if (tvl >= 1000000) {
    return `$${(tvl / 1000000).toFixed(2)}M`;
  }
  if (tvl >= 1000) {
    return `$${(tvl / 1000).toFixed(2)}K`;
  }
  return `$${tvl.toFixed(2)}`;
}
