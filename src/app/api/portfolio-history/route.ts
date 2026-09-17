import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5min edge cache

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FETCH_TIMEOUT_MS = 15000;

// Symbols that have meaningful price history (skip stablecoins)
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  ETH: 'ethereum',
  BNB: 'binancecoin',
  POL: 'matic-network',
  MATIC: 'matic-network',
  BTC: 'bitcoin',
};

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// GET /api/portfolio-history?days=30&symbols=ETH,BNB,POL
// Returns historical price arrays for each requested symbol
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const symbolsParam = searchParams.get('symbols') || 'ETH,BNB,POL';
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    // Cap days to CoinGecko's free tier limits (max 365)
    const cappedDays = Math.min(Math.max(days, 1), 365);

    // Fetch historical prices for each symbol in parallel
    const fetches = symbols.map(async (symbol) => {
      const coinId = SYMBOL_TO_COINGECKO_ID[symbol];
      if (!coinId) return { symbol, prices: [] as [number, number][] };

      try {
        const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${cappedDays}`;
        const res = await fetchWithTimeout(url);
        if (!res.ok) return { symbol, prices: [] };
        const data = await res.json();
        return { symbol, prices: data.prices || [] };
      } catch (err) {
        return { symbol, prices: [] };
      }
    });

    const results = await Promise.all(fetches);

    // Build response: { ETH: [[ts, price], ...], BNB: [...], POL: [...] }
    const history: Record<string, [number, number][]> = {};
    for (const r of results) {
      history[r.symbol] = r.prices;
    }

    return NextResponse.json({
      history,
      days: cappedDays,
      source: 'coingecko',
      fetchedAt: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch portfolio history' },
      { status: 500 }
    );
  }
}
