// GCRM Wallet - API Route for Token Prices
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, this would fetch from CoinGecko, CoinMarketCap, or a similar API
    // For now, return simulated data clearly marked
    const prices = {
      GCRM: { usd: 0.09, usd_24h_change: 3.45, usd_market_cap: 9000000 },
      ETH: { usd: 3245.67, usd_24h_change: -1.23, usd_market_cap: 390000000000 },
      BNB: { usd: 612.34, usd_24h_change: 0.87, usd_market_cap: 94000000000 },
      MATIC: { usd: 0.72, usd_24h_change: 5.12, usd_market_cap: 7200000000 },
      USDT: { usd: 1.00, usd_24h_change: 0.01, usd_market_cap: 110000000000 },
      USDC: { usd: 1.00, usd_24h_change: -0.005, usd_market_cap: 33000000000 },
    };

    return NextResponse.json({
      source: 'simulated',
      disclaimer: 'SIMULATED DATA: In production, connect to CoinGecko/CMC API',
      timestamp: Date.now(),
      data: prices,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
