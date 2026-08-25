// GCRM Wallet - API Route for Market Data
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const marketData = {
      totalVolume24h: 156000000,
      gcrmDominance: 0.034,
      fearGreedIndex: 65,
      trending: [
        { symbol: 'GCRM', name: 'GCRM Token', change: 3.45 },
        { symbol: 'ETH', name: 'Ethereum', change: -1.23 },
        { symbol: 'BNB', name: 'BNB', change: 0.87 },
      ],
      gasPrices: {
        slow: '15 Gwei',
        standard: '20 Gwei',
        fast: '30 Gwei',
      },
    };

    return NextResponse.json({
      source: 'simulated',
      disclaimer: 'SIMULATED DATA: In production, connect to real market data feeds',
      timestamp: Date.now(),
      data: marketData,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
