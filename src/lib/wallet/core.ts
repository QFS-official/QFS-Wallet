// QFS Wallet - Core Wallet Module
// Handles BIP-39 seed phrase generation, key derivation, and encryption
// All cryptographic operations happen CLIENT-SIDE only

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

  // Ensure privateKey is a proper Uint8Array and convert to hex with 0x prefix
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
  };
}

export async function unlockWallet(encryptedPrivateKey: string, password: string): Promise<string> {
  try {
    const privateKey = await decrypt(encryptedPrivateKey, password);
    // privateKey already has 0x prefix from deriveKeyPair
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

export function truncateAddress(address: string, chars: number = 6): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Storage helpers
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
