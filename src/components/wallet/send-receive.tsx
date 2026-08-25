"use client";

import { useState } from "react";
import { tokens, transactions } from "@/data/mock-data";
import { TokenIcon } from "./token-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/store/wallet-store";
import { ArrowUpRight, ArrowDownLeft, Copy, Check, QrCode, Wallet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function SendView() {
  const { walletAddress } = useWalletStore();
  const [selectedToken, setSelectedToken] = useState("QFS");
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const token = tokens.find((t) => t.symbol === selectedToken) || tokens[0];

  const handleSend = () => {
    if (!amount || !toAddress) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setAmount("");
        setToAddress("");
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="glass-card rounded-2xl p-6 glow-green">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Send Crypto</h2>
            <p className="text-xs text-muted-foreground">Transfer tokens to any wallet address</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-1">Transaction Sent!</h3>
            <p className="text-sm text-muted-foreground">Your transaction is being processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Token selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Token</Label>
              <div className="flex flex-wrap gap-2">
                {tokens.map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => setSelectedToken(t.symbol)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                      selectedToken === t.symbol
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                    )}
                  >
                    <TokenIcon symbol={t.symbol} color={t.color} icon={t.icon} size="sm" />
                    {t.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient address */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Recipient Address</Label>
              <Input
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="bg-white/5 border-white/10 h-11 font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <button
                  onClick={() => setAmount(token.balance.toString())}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Max: {token.balance.toLocaleString()} {token.symbol}
                </button>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/5 border-white/10 h-11 pr-16 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {token.symbol}
                </span>
              </div>
              {amount && (
                <p className="text-xs text-muted-foreground mt-1">
                  ~ ${(Number(amount) * token.price).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                </p>
              )}
            </div>

            {/* Network fee */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
              <span className="text-xs text-muted-foreground">Network Fee</span>
              <span className="text-xs font-medium">~$0.45</span>
            </div>

            <Button
              onClick={handleSend}
              disabled={!amount || !toAddress || sending}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gradient-border"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send " + token.symbol
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReceiveView() {
  const { walletAddress } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const fullAddress = "0x7a3b9c4d2e8f1a6b5c4d3e2f1a7b9c4d2e8f92d";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="glass-card rounded-2xl p-6 glow-cyan">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Receive Crypto</h2>
            <p className="text-xs text-muted-foreground">Share your wallet address to receive tokens</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* QR Code placeholder */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-2xl bg-white flex items-center justify-center">
              <QrCode className="w-32 h-32 text-gray-900" />
            </div>
          </div>

          {/* Address display */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Your Wallet Address</Label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-mono truncate flex-1">{fullAddress}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Supported networks */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Supported Networks</Label>
            <div className="flex flex-wrap gap-2">
              {["Ethereum", "BSC", "Polygon", "Arbitrum", "Solana"].map((net) => (
                <Badge key={net} variant="secondary" className="bg-white/5 text-muted-foreground border-white/10 text-xs">
                  {net}
                </Badge>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/80">
              Only send supported tokens to this address. Sending unsupported tokens may result in permanent loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SendView, ReceiveView };
