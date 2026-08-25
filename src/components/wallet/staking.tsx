"use client";

import { useState } from "react";
import { stakingPools, tokens } from "@/data/mock-data";
import { TokenIcon } from "./token-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, Clock, DollarSign, Lock, Unlock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function StakingCard({ pool }: { pool: typeof stakingPools[0] }) {
  const token = tokens.find((t) => t.symbol === pool.token) || tokens[0];
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"stake" | "unstake">("stake");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleAction = () => {
    if (!amount) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setAmount("");
      }, 3000);
    }, 2000);
  };

  return (
    <Card className="glass-card border-0 overflow-hidden">
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${token.color}, transparent)` }} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TokenIcon symbol={pool.token} color={token.color} icon={token.icon} />
            <div>
              <CardTitle className="text-base">{pool.token} Staking</CardTitle>
              <p className="text-xs text-muted-foreground">{pool.lockPeriod} lock period</p>
            </div>
          </div>
          <Badge className={cn("text-xs font-bold", pool.apy >= 10 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30")} variant="outline">
            {pool.apy}% APY
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pool stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-2.5 rounded-lg bg-white/5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">TVL</p>
            <p className="text-sm font-bold">${(pool.tvl / 1e6).toFixed(1)}M</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Your Stake</p>
            <p className="text-sm font-bold">{pool.staked.toLocaleString()}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Rewards</p>
            <p className="text-sm font-bold text-emerald-400">+{pool.rewards.toLocaleString()}</p>
          </div>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium">{action === "stake" ? "Staked" : "Unstaked"} Successfully!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={action === "stake" ? "default" : "secondary"}
                size="sm"
                onClick={() => setAction("stake")}
                className={cn("flex-1", action === "stake" && "bg-emerald-500 hover:bg-emerald-600 text-white")}
              >
                <Lock className="w-3.5 h-3.5 mr-1" /> Stake
              </Button>
              <Button
                variant={action === "unstake" ? "default" : "secondary"}
                size="sm"
                onClick={() => setAction("unstake")}
                className={cn("flex-1", action === "unstake" && "bg-red-500 hover:bg-red-600 text-white")}
              >
                <Unlock className="w-3.5 h-3.5 mr-1" /> Unstake
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-muted-foreground">
                  {action === "stake" ? "Amount to Stake" : "Amount to Unstake"}
                </Label>
                {action === "stake" && (
                  <button
                    onClick={() => setAmount(token.balance.toString())}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Max: {token.balance.toLocaleString()}
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/5 border-white/10 h-10 pr-16 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{pool.token}</span>
              </div>
              {amount && (
                <p className="text-xs text-emerald-400 mt-1">
                  Est. rewards: {(Number(amount) * pool.apy / 100 / 365).toFixed(4)} {pool.token}/day
                </p>
              )}
            </div>

            <Button
              onClick={handleAction}
              disabled={!amount || processing}
              className={cn(
                "w-full h-10 font-semibold",
                action === "stake"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `${action === "stake" ? "Stake" : "Unstake"} ${pool.token}`
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StakingView() {
  const totalStaked = stakingPools.reduce((sum, p) => sum + p.staked, 0);
  const totalRewards = stakingPools.reduce((sum, p) => sum + p.rewards, 0);
  const avgApy = stakingPools.reduce((sum, p) => sum + p.apy, 0) / stakingPools.length;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Total Staked</span>
            </div>
            <p className="text-xl font-bold">${totalStaked.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-muted-foreground">Avg. APY</span>
            </div>
            <p className="text-xl font-bold text-cyan-400">{avgApy.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Rewards</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">+{totalRewards.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Active Pools</span>
            </div>
            <p className="text-xl font-bold">{stakingPools.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking pools */}
      <div>
        <h3 className="text-lg font-bold mb-4">Available Pools</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stakingPools.map((pool) => (
            <StakingCard key={pool.id} pool={pool} />
          ))}
        </div>
      </div>
    </div>
  );
}
