import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // cache 60s at the edge

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FETCH_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// GET /api/prices?symbols=ETH,BNB,POL,USDT,USDC
// Returns USD prices + 24h change for the requested symbols
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols') || '';
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    // Map symbols to CoinGecko coin IDs
    const COIN_ID_BY_SYMBOL: Record<string, string> = {
      ETH: 'ethereum',
      BNB: 'binancecoin',
      POL: 'matic-network',
      MATIC: 'matic-network',
      USDT: 'tether',
      USDC: 'usd-coin',
      BTC: 'bitcoin',
    };

    const ids: string[] = [];
    const symbolToId: Record<string, string> = {};
    for (const s of symbols) {
      const id = COIN_ID_BY_SYMBOL[s];
      if (id) {
        ids.push(id);
        symbolToId[s] = id;
      }
    }

    if (ids.length === 0) {
      return NextResponse.json({ prices: {} });
    }

    const url = `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `CoinGecko HTTP ${res.status}` },
        { status: 502 }
      );
    }
    const data = await res.json();

    // Build response keyed by symbol
    const prices: Record<string, { usd: number; change24h: number }> = {};
    for (const [symbol, id] of Object.entries(symbolToId)) {
      if (data[id]) {
        prices[symbol] = {
          usd: data[id].usd ?? 0,
          change24h: data[id].usd_24h_change ?? 0,
        };
      }
    }

    return NextResponse.json({
      prices,
      source: 'coingecko',
      fetchedAt: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
