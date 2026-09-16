'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/store/wallet';
import { BalanceHero } from '@/components/dashboard/BalanceHero';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { AssetsTable } from '@/components/dashboard/AssetsTable';
import { WalletAddressCard } from '@/components/dashboard/WalletAddressCard';
import { PortfolioDonut } from '@/components/dashboard/PortfolioDonut';
import { MarketsList } from '@/components/dashboard/MarketsList';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import type { Screen } from '@/types/wallet';

export function DashboardScreen({ onAction }: { onAction: (action: Screen) => void }) {
  const stats = useMemo(
    () => ({
      totalAssets: 42_870_000,
      totalAssetsChange: 12.4,
      liquidityPool: 18_450_000,
      liquidityPoolChange: 8.7,
      apy: 12.6,
    }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="min-w-0">
          <BalanceHero onAction={onAction} />
          <StatsRow
            totalAssets={stats.totalAssets}
            totalAssetsChange={stats.totalAssetsChange}
            liquidityPool={stats.liquidityPool}
            liquidityPoolChange={stats.liquidityPoolChange}
            apy={stats.apy}
          />
          <AssetsTable />
        </div>
        <aside className="flex flex-col gap-0">
          <WalletAddressCard />
          <PortfolioDonut />
          <MarketsList />
          <RecentTransactions />
        </aside>
      </div>
    </motion.div>
  );
}
