"use client";

import { useWalletStore } from "@/store/wallet-store";
import { WalletSidebar } from "./sidebar";
import { DashboardView } from "./dashboard";
import { SendView, ReceiveView } from "./send-receive";
import { SwapView } from "./swap";
import { StakingView } from "./staking";
import { SettingsView } from "./settings";
import { Menu, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function MobileHeader() {
  const { setSidebarOpen, connected, walletAddress } = useWalletStore();
  return (
    <header className="sticky top-0 z-30 lg:hidden bg-background/90 backdrop-blur-lg border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">Q</span>
            </div>
            <span className="font-bold gradient-text">QFS Wallet</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-xs gap-1">
              <Wifi className="w-3 h-3" />
              <span className="hidden sm:inline font-mono">{walletAddress}</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-0 text-xs gap-1">
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}

function ConnectWalletPrompt() {
  const { setConnected } = useWalletStore();
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 text-center glow-green">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-white">Q</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to QFS Wallet</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Connect your wallet to access the Quantum Financial System. Manage, swap, and stake your digital assets securely.
        </p>
        <div className="space-y-3">
          {[
            { name: "MetaMask", icon: "M", color: "#f6851b", desc: "Browser extension wallet" },
            { name: "WalletConnect", icon: "W", color: "#3b99fc", desc: "Mobile wallet connection" },
            { name: "Coinbase Wallet", icon: "C", color: "#0052ff", desc: "Coinbase ecosystem" },
            { name: "Phantom", icon: "P", color: "#ab9ff2", desc: "Solana ecosystem" },
          ].map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => setConnected(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: wallet.color }}
              >
                {wallet.icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold group-hover:text-emerald-400 transition-colors">{wallet.name}</p>
                <p className="text-xs text-muted-foreground">{wallet.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WalletShell() {
  const { activeTab, connected } = useWalletStore();

  return (
    <div className="min-h-screen bg-background">
      <WalletSidebar />
      <MobileHeader />

      {/* Main content area */
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-6">
        <div className="p-4 lg:p-6">
          {!connected ? (
            <ConnectWalletPrompt />
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold capitalize">{activeTab === "send" || activeTab === "receive" ? activeTab + " Crypto" : activeTab}</h1>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "dashboard" && "Overview of your portfolio and activity"}
                    {activeTab === "send" && "Transfer tokens to any wallet"}
                    {activeTab === "receive" && "Receive tokens to your wallet"}
                    {activeTab === "swap" && "Trade tokens across chains"}
                    {activeTab === "staking" && "Earn passive income with your crypto"}
                    {activeTab === "settings" && "Manage security and preferences"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                </Button>
              </div>

              {/* Tab content */}
              {activeTab === "dashboard" && <DashboardView />}
              {activeTab === "send" && <SendView />}
              {activeTab === "receive" && <ReceiveView />}
              {activeTab === "swap" && <SwapView />}
              {activeTab === "staking" && <StakingView />}
              {activeTab === "settings" && <SettingsView />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
