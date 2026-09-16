// QFS Wallet — Staking Pool Configurations
import type { StakingPool } from '@/types/wallet';

export const STAKING_POOLS: StakingPool[] = [
  {
    id: 'qfs-90',
    name: 'QFS 90 Días',
    duration: 90,
    durationLabel: '90 días',
    apy: 42.23,
    minStake: 100,
    maxStake: 10_000_000,
    totalStaked: 45_230_000,
    tvl: 4_070_700,
  },
  {
    id: 'qfs-30',
    name: 'QFS 30 Días',
    duration: 30,
    durationLabel: '30 días',
    apy: 28.67,
    minStake: 50,
    maxStake: 5_000_000,
    totalStaked: 22_150_000,
    tvl: 1_993_500,
  },
  {
    id: 'qfs-flexible',
    name: 'QFS Flexible',
    duration: 0,
    durationLabel: 'Flexible',
    apy: 15.25,
    minStake: 10,
    maxStake: 1_000_000,
    totalStaked: 8_900_000,
    tvl: 801_000,
  },
];

export function calculateStakingRewards(amount: number, apy: number, days: number): number {
  return amount * (apy / 100) * (days / 365);
}

export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

export function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(2)}K`;
  return `$${tvl.toFixed(2)}`;
}
