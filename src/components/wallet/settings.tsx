"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useWalletStore } from "@/store/wallet-store";
import {
  Shield,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Fingerprint,
  Globe,
  Bell,
  LogOut,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function SecuritySection() {
  const [showSeed, setShowSeed] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [copied, setCopied] = useState(false);
  const walletAddress = "0x7a3b9c4d2e8f1a6b5c4d3e2f1a7b9c4d2e8f92d";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <CardTitle className="text-base">Security</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet address */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Wallet Address</Label>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm font-mono truncate flex-1">{walletAddress}</span>
            <Button variant="ghost" size="icon" onClick={handleCopyAddress} className="shrink-0 h-8 w-8">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </Button>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* 2FA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Extra layer of security for transactions</p>
            </div>
          </div>
          <Switch checked={twoFA} onCheckedChange={setTwoFA} className="data-[state=checked]:bg-emerald-500" />
        </div>

        <Separator className="bg-white/5" />

        {/* Biometric */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Biometric Login</p>
              <p className="text-xs text-muted-foreground">Use fingerprint or face recognition</p>
            </div>
          </div>
          <Switch checked={biometric} onCheckedChange={setBiometric} className="data-[state=checked]:bg-emerald-500" />
        </div>

        <Separator className="bg-white/5" />

        {/* Recovery phrase */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Recovery Phrase</p>
              <p className="text-xs text-muted-foreground">12-word backup phrase</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSeed(!showSeed)}
            className="w-full border-amber-500/20 hover:bg-amber-500/5 text-amber-400 mt-1"
          >
            {showSeed ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showSeed ? "Hide Phrase" : "Reveal Phrase"}
          </Button>
          {showSeed && (
            <div className="mt-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {["orbit", "galaxy", "quantum", "nebula", "photon", "stellar", "cosmos", "pulsar", "quasar", "plasma", "proton", "electron"].map(
                  (word, i) => (
                    <div key={i} className="flex gap-1">
                      <span className="text-amber-400 w-4">{i + 1}.</span>
                      <span>{word}</span>
                    </div>
                  )
                )}
              </div>
              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-400/80">Never share your recovery phrase with anyone. Store it in a secure location.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PreferencesSection() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <CardTitle className="text-base">Preferences</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive transaction alerts</p>
            </div>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} className="data-[state=checked]:bg-emerald-500" />
        </div>

        <Separator className="bg-white/5" />

        {/* Email alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Email Alerts</p>
              <p className="text-xs text-muted-foreground">Get important updates via email</p>
            </div>
          </div>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} className="data-[state=checked]:bg-emerald-500" />
        </div>

        <Separator className="bg-white/5" />

        {/* Currency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Display Currency</p>
              <p className="text-xs text-muted-foreground">Preferred fiat currency</p>
            </div>
          </div>
          <div className="flex gap-1">
            {["USD", "EUR", "GBP"].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  currency === c
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Language</p>
              <p className="text-xs text-muted-foreground">Interface language</p>
            </div>
          </div>
          <div className="flex gap-1">
            {["EN", "ES"].map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l.toLowerCase())}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  language === l.toLowerCase()
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DangerSection() {
  const { setConnected } = useWalletStore();
  return (
    <Card className="glass-card border-0 border-red-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <CardTitle className="text-base text-red-400">Danger Zone</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Disconnect Wallet</p>
            <p className="text-xs text-muted-foreground">Remove wallet connection from this session</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConnected(false)}
            className="border-red-500/30 hover:bg-red-500/10 text-red-400"
          >
            <LogOut className="w-4 h-4 mr-1" /> Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your wallet security and preferences</p>
      </div>
      <SecuritySection />
      <PreferencesSection />
      <DangerSection />
    </div>
  );
}
