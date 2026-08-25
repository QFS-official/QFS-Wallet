"use client";

import { tokens, transactions, chartData, allocationData } from "@/data/mock-data";
import { TokenIcon } from "./token-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ExternalLink } from "lucide-react";
import { useWalletStore } from "@/store/wallet-store";
import { cn } from "@/lib/utils";

const totalBalance = tokens.reduce((sum, t) => sum + t.balance * t.price, 0);
const totalChange = 2.4;

function StatCard({ title, value, change, icon: Icon }: { title: string; value: string; change?: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="glass-card border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">{title}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xl font-bold">{value}</p>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", change >= 0 ? "text-emerald-400" : "text-red-400")}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? "+" : ""}{change}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BalanceChart() {
  return (
    <Card className="glass-card border-0 col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Performance</CardTitle>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">7D</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
              />
              <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fill="url(#balanceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function AllocationChart() {
  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Allocation</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col items-center">
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full">
          {allocationData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-medium">${((item.value / totalBalance) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AssetList() {
  const { setActiveTab } = useWalletStore();
  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Assets</CardTitle>
          <button onClick={() => setActiveTab("swap")}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
            Trade All <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <TokenIcon symbol={token.symbol} color={token.color} icon={token.icon} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{token.symbol}</span>
                  <span className="text-xs text-muted-foreground truncate">{token.name}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  ${(token.balance * token.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className={cn("text-xs font-medium", token.change24h >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionList() {
  const { setActiveTab } = useWalletStore();
  const typeIcons = {
    send: ArrowUpRight,
    receive: ArrowDownLeft,
    swap: ArrowLeftRight,
    stake: Coins,
    unstake: Coins,
  };
  const typeColors = {
    send: "text-red-400 bg-red-400/10",
    receive: "text-emerald-400 bg-emerald-400/10",
    swap: "text-cyan-400 bg-cyan-400/10",
    stake: "text-purple-400 bg-purple-400/10",
    unstake: "text-amber-400 bg-amber-400/10",
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
          <button onClick={() => setActiveTab("send")}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {transactions.slice(0, 5).map((tx) => {
            const Icon = typeIcons[tx.type];
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", typeColors[tx.type])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{tx.type}</span>
                    <span className="text-xs text-muted-foreground">{tx.token}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{tx.address}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-medium", tx.type === "receive" ? "text-emerald-400" : tx.type === "send" ? "text-red-400" : "")}>
                    {tx.type === "receive" ? "+" : "-"}{tx.amount.toLocaleString()} {tx.token.split(" ")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${tx.usdValue.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Header balance */}
      <div className="glass-card rounded-2xl p-6 glow-green">
        <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
        <div className="flex items-end gap-3">
          <h2 className="text-4xl font-bold tracking-tight">
            ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-1 text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">+{totalChange}%</span>
            <span className="text-xs text-muted-foreground">24h</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="24h Volume" value="$12,450" change={8.2} icon={TrendingUp} />
        <StatCard title="Assets" value={`${tokens.length} tokens`} icon={Coins} />
        <StatCard title="Staked" value="$12,350" change={12.5} icon={Coins} />
        <StatCard title="Transactions" value={`${transactions.length}`} icon={ArrowLeftRight} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BalanceChart />
        <AllocationChart />
      </div>

      {/* Assets and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AssetList />
        <TransactionList />
      </div>
    </div>
  );
}
