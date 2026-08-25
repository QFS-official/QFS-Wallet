// GCRM Wallet - API Route for Network Configuration
import { NextResponse } from 'next/server';

export async function GET() {
  const networks = [
    { id: 1, name: 'Ethereum', symbol: 'ETH', rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io', status: 'active' },
    { id: 56, name: 'BNB Smart Chain', symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org', explorer: 'https://bscscan.com', status: 'active' },
    { id: 137, name: 'Polygon', symbol: 'MATIC', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com', status: 'active' },
    { id: 42161, name: 'Arbitrum One', symbol: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io', status: 'active' },
    { id: 8453, name: 'Base', symbol: 'ETH', rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org', status: 'active' },
    { id: 59144, name: 'Linea', symbol: 'ETH', rpc: 'https://rpc.linea.build', explorer: 'https://lineascan.build', status: 'active' },
  ];

  return NextResponse.json({ data: networks });
}
