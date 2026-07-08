// app/api/cron/portfolio-refresh/route.ts
//
// Refreshes portfolio_prices for every ticker currently held, using
// Yahoo Finance's public chart endpoint directly (no Python needed
// for this lightweight job -- keeps everything in one Vercel deploy).

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

async function fetchLatestClose(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await resp.json();
    const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (!closes) return null;
    const validCloses = closes.filter((c: number | null) => c !== null);
    return validCloses.length ? validCloses[validCloses.length - 1] : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: positions, error: posError } = await supabaseServer
    .from('portfolio_positions')
    .select('ticker')
    .eq('status', 'OPEN');

  if (posError) return NextResponse.json({ error: posError.message }, { status: 500 });

  const tickers = Array.from(new Set((positions || []).map((p) => p.ticker)));
  if (tickers.length === 0) {
    return NextResponse.json({ message: 'No open positions to price.' });
  }

  const today = new Date().toISOString().split('T')[0];
  const results: Record<string, number | null> = {};

  for (const ticker of tickers) {
    const price = await fetchLatestClose(ticker);
    results[ticker] = price;
    if (price !== null) {
      await supabaseServer
        .from('portfolio_prices')
        .upsert({ ticker, current_price: price, price_date: today }, { onConflict: 'ticker' });
    }
  }

  return NextResponse.json({ success: true, updated: results });
}
