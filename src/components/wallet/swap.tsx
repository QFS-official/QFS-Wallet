"use client";

import { useState } from "react";
import { tokens } from "@/data/mock-data";
import { TokenIcon } from "./token-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowDown, Settings2, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SwapView() {
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState("QFS");
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [swapping, setSwapping] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [showTokenSelect, setShowTokenSelect] = useState<"from" | "to" | null>(null);

  const from = tokens.find((t) => t.symbol === fromToken) || tokens[3];
  const to = tokens.find((t) => t.symbol === toToken) || tokens[0];
  const toAmount = fromAmount ? (Number(fromAmount) * from.price) / to.price : "";
  const priceImpact = fromAmount ? Math.abs(Number(fromAmount) * 0.002).toFixed(4) : "0.00";

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
  };

  const handleSwap = () => {
    if (!fromAmount) return;
    setSwapping(true);
    setTimeout(() => {
      setSwapping(false);
      setSwapped(true);
      setTimeout(() => {
        setSwapped(false);
        setFromAmount("");
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="glass-card rounded-2xl p-6 glow-green relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Swap Tokens</h2>
            <p className="text-xs text-muted-foreground">Trade tokens instantly with low fees</p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>

        {swapped ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-1">Swap Complete!</h3>
            <p className="text-sm text-muted-foreground">Your tokens have been exchanged</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* From token */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">You Pay</Label>
                <span className="text-xs text-muted-foreground">
                  Balance: {from.balance.toLocaleString()} {from.symbol}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-2xl font-bold h-auto p-0 focus-visible:ring-0"
                />
                <button
                  onClick={() => setShowTokenSelect("from")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors shrink-0"
                >
                  <TokenIcon symbol={from.symbol} color={from.color} icon={from.icon} size="sm" />
                  <span className="text-sm font-semibold">{from.symbol}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => setFromAmount(from.balance.toString())}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Max
                </button>
                {fromAmount && (
                  <span className="text-xs text-muted-foreground">
                    ~${(Number(fromAmount) * from.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* Swap direction button */}
            <div className="flex justify-center -my-1 relative z-10">
              <button
                onClick={handleSwapTokens}
                className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* To token */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">You Receive</Label>
                <span className="text-xs text-muted-foreground">
                  Balance: {to.balance.toLocaleString()} {to.symbol}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-2xl font-bold text-muted-foreground">
                  {toAmount
                    ? Number(toAmount).toLocaleString(undefined, { maximumFractionDigits: 4 })
                    : "0.00"}
                </div>
                <button
                  onClick={() => setShowTokenSelect("to")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors shrink-0"
                >
                  <TokenIcon symbol={to.symbol} color={to.color} icon={to.icon} size="sm" />
                  <span className="text-sm font-semibold">{to.symbol}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Slippage */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Slippage Tolerance</Label>
              <div className="flex gap-2">
                {["0.1", "0.5", "1.0"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlippage(val)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      slippage === val
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                    )}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Swap details */}
            {fromAmount && (
              <div className="space-y-2 p-3 rounded-lg bg-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span>1 {from.symbol} = {(from.price / to.price).toFixed(6)} {to.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={cn(Number(priceImpact) > 1 ? "text-amber-400" : "text-emerald-400")}>
                    {priceImpact}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~$0.85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min. Received</span>
                  <span>
                    {toAmount
                      ? (Number(toAmount) * (1 - Number(slippage) / 100)).toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })
                      : "0"}{" "}
                    {to.symbol}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSwap}
              disabled={!fromAmount || swapping}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base"
            >
              {swapping ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Swapping...
                </span>
              ) : !fromAmount ? (
                "Enter an amount"
              ) : (
                "Swap"
              )}
            </Button>
          </div>
        )}

        {/* Token select modal */}
        {showTokenSelect && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl z-20 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Select Token</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTokenSelect(null)}
                className="text-muted-foreground"
              >
                Close
              </Button>
            </div>
            <Input
              placeholder="Search by name or symbol..."
              className="bg-white/5 border-white/10 mb-3"
            />
            <div className="space-y-1">
              {tokens.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => {
                    if (showTokenSelect === "from") setFromToken(t.symbol);
                    else setToToken(t.symbol);
                    setShowTokenSelect(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <TokenIcon symbol={t.symbol} color={t.color} icon={t.icon} />
                  <div className="text-left">
                    <p className="text-sm font-semibold">{t.symbol}</p>
                    <p className="text-xs text-muted-foreground">{t.name}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-medium">{t.balance.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(t.balance * t.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
