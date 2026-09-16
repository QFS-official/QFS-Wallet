// QFS Wallet — Receive helpers (multi-token × multi-chain)

import type { Token } from '@/types/wallet';
import { QFS_TOKEN, GCRM_TOKEN, ALA_TOKEN, TRAEX_TOKEN, NATIVE_TOKENS } from '@/lib/wallet/tokens';

// ─── Asset catalog (for the Receive screen) ───────────────────────
// 4 official tokens × 3 networks (ETH, Polygon, BNB) = 12 combinations
// For native assets (ETH/BNB/POL), the "contract" is 0x0 and the user
// receives by sending to their wallet address on that chain.
// For ERC-20 tokens (QFS/GCRM/AlA/TRAEX), the sender must transfer
// via the token contract on the matching chain.

export interface ReceiveAsset {
  key: string;           // unique key e.g. "QFS:1"
  symbol: string;        // QFS, GCRM, AlA, TRAEX, ETH, BNB, POL
  name: string;
  chainId: number;
  chainName: string;
  chainSymbol: string;
  chainIcon: string;     // emoji/icon char
  chainColor: string;
  contractAddress: string; // '0x0' for native, real address for ERC-20
  decimals: number;
  isNative: boolean;
  tokenColor: string;     // brand color of the token
  tokenLogo: string;      // logo path for TokenIcon to display
  available: boolean;     // false when no contract deployed on this chain
}

// The 3 networks the user explicitly requested
const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', icon: '⟠', color: '#627EEA' },
  { id: 137, name: 'Polygon', symbol: 'POL', icon: '⬡', color: '#8247E5' },
  { id: 56, name: 'BNB Smart Chain', symbol: 'BNB', icon: '◆', color: '#F3BA2F' },
];

// Build the 4 tokens × 3 chains matrix + the 3 native assets
const TOKEN_LOGOS: Record<string, string> = {
  QFS: '/qfs-logo-official.png',
  GCRM: '/gcrm-logo-official.png',
  AlA: '/ala-logo-official.png',
  TRAEX: '/traex-logo-official.png',
  ETH: '/eth-token-logo.png',
  BNB: '/bnb-token-logo.png',
  POL: '/pol-token-logo.png',
};

const TOKEN_COLORS: Record<string, string> = {
  QFS: '#06B6D4',
  GCRM: '#F59E0B',
  AlA: '#8B5CF6',
  TRAEX: '#EC4899',
  ETH: '#627EEA',
  BNB: '#F3BA2F',
  POL: '#8247E5',
};

const TOKEN_NAMES: Record<string, string> = {
  QFS: 'QFS Token',
  GCRM: 'Global Currency Restart Master',
  AlA: 'AlArab',
  TRAEX: 'TRAEX Token',
  ETH: 'Ethereum',
  BNB: 'BNB',
  POL: 'Polygon',
};

const ZERO = '0x0000000000000000000000000000000000000000';

// Build all 4 ERC-20 tokens × 3 chains
const ERC20_TOKENS: Record<number, Omit<Token, 'balance' | 'valueUsd' | 'change24h'>>[] = [
  QFS_TOKEN, GCRM_TOKEN, ALA_TOKEN, TRAEX_TOKEN,
];

export const RECEIVE_ASSETS: ReceiveAsset[] = (() => {
  const list: ReceiveAsset[] = [];

  // Native assets: ETH on Ethereum, POL on Polygon, BNB on BNB Chain
  for (const chain of SUPPORTED_CHAINS) {
    const native = NATIVE_TOKENS[chain.id];
    if (native) {
      list.push({
        key: `${native.symbol}:${chain.id}`,
        symbol: native.symbol,
        name: TOKEN_NAMES[native.symbol] || native.name,
        chainId: chain.id,
        chainName: chain.name,
        chainSymbol: chain.symbol,
        chainIcon: chain.icon,
        chainColor: chain.color,
        contractAddress: '0x0',
        decimals: native.decimals,
        isNative: true,
        tokenColor: TOKEN_COLORS[native.symbol] || chain.color,
        tokenLogo: TOKEN_LOGOS[native.symbol] || '',
        available: true,
      });
    }
  }

  // ERC-20 tokens: QFS, GCRM, AlA, TRAEX across the 3 chains
  for (const tokenMap of ERC20_TOKENS) {
    for (const chain of SUPPORTED_CHAINS) {
      const t = tokenMap[chain.id];
      if (!t) continue;
      const realContract = t.address && t.address !== ZERO;
      list.push({
        key: `${t.symbol}:${chain.id}`,
        symbol: t.symbol,
        name: t.name,
        chainId: chain.id,
        chainName: chain.name,
        chainSymbol: chain.symbol,
        chainIcon: chain.icon,
        chainColor: chain.color,
        contractAddress: t.address,
        decimals: t.decimals,
        isNative: false,
        tokenColor: TOKEN_COLORS[t.symbol] || '#06B6D4',
        tokenLogo: TOKEN_LOGOS[t.symbol] || '',
        available: realContract,
      });
    }
  }

  return list;
})();

// Group by chain for UI display
export function groupAssetsByChain(): Record<number, ReceiveAsset[]> {
  const groups: Record<number, ReceiveAsset[]> = {};
  for (const a of RECEIVE_ASSETS) {
    if (!groups[a.chainId]) groups[a.chainId] = [];
    groups[a.chainId].push(a);
  }
  return groups;
}

// Group by token symbol
export function groupAssetsByToken(): Record<string, ReceiveAsset[]> {
  const groups: Record<string, ReceiveAsset[]> = {};
  for (const a of RECEIVE_ASSETS) {
    if (!groups[a.symbol]) groups[a.symbol] = [];
    groups[a.symbol].push(a);
  }
  return groups;
}

// ─── EIP-681 payment request URI ──────────────────────────────────
// Format: ethereum:<address>?value=<amount>&token=<tokenContractAddress>
// Many wallets recognize this format and prefill send forms.
export function buildPaymentURI(
  walletAddress: string,
  asset: ReceiveAsset,
  amount?: string
): string {
  if (asset.isNative) {
    // For native assets: ethereum:<address>?value=<amount>
    const valueParam = amount ? `?value=${amount}` : '';
    return `ethereum:${walletAddress}${valueParam}`;
  }
  // For ERC-20 tokens: ethereum:<tokenContract>@<chainId>/transfer?address=<wallet>&uint256=<amount>
  // Simpler EIP-681: ethereum:<tokenContract>/transfer?address=<wallet>&uint256=<amount>
  if (amount) {
    return `ethereum:${asset.contractAddress}/transfer?address=${walletAddress}&uint256=${amount}`;
  }
  // Without amount — just pay-to-contract indication
  return `ethereum:${asset.contractAddress}@${asset.chainId}/transfer?address=${walletAddress}`;
}

// Truncate address for display: 0x1234...abcd
export function truncate(address: string, chars: number = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
