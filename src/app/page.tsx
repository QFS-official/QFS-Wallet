'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/store/wallet';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { ToastContainer } from '@/components/dashboard/ToastContainer';
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { WalletScreen } from '@/components/screens/WalletScreen';
import { SendScreen } from '@/components/screens/SendScreen';
import { ReceiveScreen } from '@/components/screens/ReceiveScreen';
import { SwapScreen } from '@/components/screens/SwapScreen';
import { StakingScreen } from '@/components/screens/StakingScreen';
import { DAppsScreen } from '@/components/screens/DAppsScreen';
import { MarketsScreen } from '@/components/screens/MarketsScreen';
import { SecurityScreen } from '@/components/screens/SecurityScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { CreateWalletScreen } from '@/components/onboarding/CreateWalletScreen';
import { ImportWalletScreen } from '@/components/onboarding/ImportWalletScreen';
import { UnlockScreen } from '@/components/onboarding/UnlockScreen';
import { WalletsScreen } from '@/components/screens/WalletsScreen';
import type { Screen } from '@/types/wallet';

export default function QFSWalletPage() {
  const initialize = useWalletStore((s) => s.initialize);
  const currentScreen = useWalletStore((s) => s.currentScreen);
  const navigate = useWalletStore((s) => s.navigate);
  const isWalletCreated = useWalletStore((s) => s.isWalletCreated);
  const isWalletLocked = useWalletStore((s) => s.isWalletLocked);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onAction={(a) => navigate(a)} />;
      case 'wallet':
        return <WalletScreen />;
      case 'wallets':
        return <WalletsScreen />;
      case 'send':
        return <SendScreen />;
      case 'receive':
        return <ReceiveScreen />;
      case 'swap':
        return <SwapScreen />;
      case 'staking':
        return <StakingScreen />;
      case 'dapps':
        return <DAppsScreen />;
      case 'markets':
        return <MarketsScreen />;
      case 'security':
        return <SecurityScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'create-wallet':
        return <CreateWalletScreen />;
      case 'import-wallet':
        return <ImportWalletScreen />;
      case 'unlock':
        return <UnlockScreen />;
      default:
        return <DashboardScreen onAction={(a) => navigate(a)} />;
    }
  };

  // Onboarding + unlock screens are full-screen (no sidebar, no header)
  const isOnboarding =
    !isWalletCreated ||
    isWalletLocked ||
    ['create-wallet', 'import-wallet', 'unlock', 'seed-verify'].includes(currentScreen);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 px-4 lg:px-6 py-6 max-w-[1400px] w-full mx-auto">
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>
        </main>

        <footer className="mt-auto px-4 lg:px-6 py-4 border-t border-white/[0.04] text-center">
          <p className="text-[11px] text-muted-foreground/70">
            © 2026 QFS Official · Quantum Financial System · Tu mundo cripto, en tus manos
          </p>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
}
