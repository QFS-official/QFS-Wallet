// QFS Wallet — Core Wallet Module
// BIP-39 seed phrase generation, HD key derivation, AES-256-GCM encryption.
// ALL cryptographic operations happen CLIENT-SIDE only.

import { generateMnemonic, validateMnemonic, mnemonicToSeed } from '@scure/bip39';
import { wordlist } from './wordlist';
import { HDKey } from '@scure/bip32';
import { ethers } from 'ethers';
import { encrypt, decrypt } from './crypto';

export async function generateSeedPhrase(strength: 128 | 256 = 128): Promise<string> {
  return generateMnemonic(wordlist, strength);
}

export function validateSeedPhrase(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist);
}

export async function deriveKeyPair(mnemonic: string, index: number = 0) {
  const seed = await mnemonicToSeed(mnemonic);
  const masterKey = HDKey.fromMasterSeed(seed);
  const path = `m/44'/60'/${index}'/0/0`;
  const childKey = masterKey.derive(path);
  const privateKey = childKey.privateKey;
  const publicKey = childKey.publicKey;

  const pkHex = '0x' + Buffer.from(privateKey!).toString('hex');
  const wallet = new ethers.Wallet(pkHex);

  return {
    address: wallet.address,
    privateKey: pkHex,
    publicKey: Buffer.from(publicKey!).toString('hex'),
    derivationPath: path,
  };
}

export async function createEncryptedWallet(password: string, mnemonic?: string, accountIndex: number = 0) {
  const seedPhrase = mnemonic || (await generateSeedPhrase());
  const { address, privateKey, publicKey } = await deriveKeyPair(seedPhrase, accountIndex);

  const encryptedData = await encrypt(privateKey, password);

  return {
    address,
    encryptedPrivateKey: encryptedData,
    publicKey,
    seedPhrase,
  };
}

export async function unlockWallet(encryptedPrivateKey: string, password: string): Promise<string> {
  try {
    const privateKey = await decrypt(encryptedPrivateKey, password);
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  } catch {
    throw new Error('Invalid password or corrupted wallet data');
  }
}

export async function privateKeyToAddress(privateKey: string): Promise<string> {
  const pk = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
  const wallet = new ethers.Wallet(pk);
  return wallet.address;
}

export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Storage helpers (all client-side, namespaced)
const STORAGE_PREFIX = 'qfs_wallet_';

export function saveToStorage(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

// Format helpers
export function formatUsd(value: number, decimals: number = 2): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(decimals)}`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPct(value: number, withSign: boolean = true): string {
  const sign = value >= 0 && withSign ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function shortTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'hace unos segundos';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
  return `hace ${Math.floor(seconds / 86400)} d`;
}
