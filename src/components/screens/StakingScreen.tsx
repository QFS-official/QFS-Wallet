'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Unlock, Coins, ChevronRight, Calculator } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { TokenIcon } from '@/components/dashboard/TokenIcon';
import { STAKING_POOLS, calculateStakingRewards, formatAPY, formatTVL } from '@/lib/wallet/staking';

export function StakingScreen() {
  const stakingPositions = useWalletStore((s) => s.stakingPositions);
  const addStakingPosition = useWalletStore((s) => s.addStakingPosition);
  const addToast = useWalletStore((s) => s.addToast);

  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [staking, setStaking] = useState(false);
  const [calcAmount, setCalcAmount] = useState('1000');

  const calcValue = parseFloat(calcAmount) || 0;
  const selectedPoolObj = STAKING_POOLS.find((p) => p.id === selectedPool);

  const handleStake = async () => {
    if (!selectedPoolObj || !stakeAmount) return;
    setStaking(true);
    await new Promise((r) => setTimeout(r, 1200));
    const amt = parseFloat(stakeAmount);
    const days = selectedPoolObj.duration || 30;
    const rewards = calculateStakingRewards(amt, selectedPoolObj.apy, days);
    addStakingPosition({
      poolId: selectedPoolObj.id,
      amount: amt,
      rewards,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
      status: 'active',
    });
    addToast(`Stakeado: ${amt} QFS en ${selectedPoolObj.name}`, 'success');
    setStakeAmount('');
    setSelectedPool(null);
    setStaking(false);
  };

  return (
    <ScreenShell
      title="Staking"
      subtitle="Haz stake de QFS y obtén recompensas"
    >
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total en Stake" value={stakingPositions.reduce((acc, p) => acc + p.amount, 0).toLocaleString()} unit="QFS" icon={Lock} color="#06B6D4" />
        <StatCard label="Recompensas" value={stakingPositions.reduce((acc, p) => acc + p.rewards, 0).toFixed(2)} unit="QFS" icon={Coins} color="#10B981" />
        <StatCard label="APY Promedio" value="28.6" unit="%" icon={TrendingUp} color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Staking pools */}
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Pools Disponibles</h2>
          <div className="space-y-3">
            {STAKING_POOLS.map((pool, i) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card glass-card-hover rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol="QFS" size={40} color="#06B6D4" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{pool.name}</p>
                      <p className="text-[11px] text-muted-foreground">{pool.durationLabel} · Min {pool.minStake} QFS</p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  >
                    {formatAPY(pool.apy)} APY
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">TVL</p>
                    <p className="text-foreground font-semibold tabular-nums">{formatTVL(pool.tvl)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Total Stake</p>
                    <p className="text-foreground font-semibold tabular-nums">{(pool.totalStaked / 1_000_000).toFixed(2)}M</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Máximo</p>
                    <p className="text-foreground font-semibold tabular-nums">{(pool.maxStake / 1_000_000).toFixed(0)}M</p>
                  </div>
                </div>

                {selectedPool === pool.id ? (
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Cantidad</label>
                      <span className="text-[11px] text-muted-foreground">Saldo: 28,452,310 QFS</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.00"
                        type="number"
                        className="flex-1 h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-bold focus:outline-none focus:border-cyan-500/40"
                      />
                      <button
                        onClick={handleStake}
                        disabled={!stakeAmount || staking}
                        className="px-5 h-10 rounded-lg qfs-btn-primary text-sm disabled:opacity-40"
                      >
                        {staking ? (
                          <div className="w-4 h-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Stakear'
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedPool(null)}
                        className="px-3 h-10 rounded-lg qfs-btn-ghost text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                    {stakeAmount && (
                      <p className="text-[11px] text-emerald-400 mt-2">
                        Recompensa estimada: {calculateStakingRewards(parseFloat(stakeAmount), pool.apy, pool.duration || 30).toFixed(2)} QFS en {pool.durationLabel}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPool(pool.id)}
                    className="w-full h-10 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    Stakear ahora <ChevronRight size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column: calculator + active positions */}
        <div className="space-y-4">
          {/* Calculator */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calculator size={14} className="text-cyan-400" /> Calculadora
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  Monto a stakear
                </label>
                <input
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  type="number"
                  placeholder="1000"
                  className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-bold focus:outline-none focus:border-cyan-500/40"
                />
              </div>
              <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                {STAKING_POOLS.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      +{calculateStakingRewards(calcValue, p.apy, p.duration || 30).toFixed(2)} QFS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active positions */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Posiciones Activas</h3>
            {stakingPositions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No tienes posiciones activas
              </p>
            ) : (
              <div className="space-y-3">
                {stakingPositions.map((pos, i) => {
                  const pool = STAKING_POOLS.find((p) => p.id === pos.poolId);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">{pool?.name}</span>
                        <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                          {pos.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <p className="text-muted-foreground text-[10px]">Stakeado</p>
                          <p className="text-foreground font-semibold tabular-nums">{pos.amount.toLocaleString()} QFS</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-[10px]">Recompensas</p>
                          <p className="text-emerald-400 font-semibold tabular-nums">+{pos.rewards.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function StatCard({ label, value, unit, icon: Icon, color }: {
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: `${color}14`, border: `1px solid ${color}26` }}
        >
          <Icon size={14} color={color} />
        </div>
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">
        {value} <span className="text-base text-muted-foreground font-medium">{unit}</span>
      </p>
    </div>
  );
}
