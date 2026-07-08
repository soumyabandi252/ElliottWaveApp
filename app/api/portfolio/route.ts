// app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('v_portfolio_summary')
    .select('*')
    .order('entry_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ticker, shares, entry_price, entry_date, notes } = body;

  if (!ticker || !shares || !entry_price || !entry_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabaseServer.from('portfolio_positions').insert({
    ticker: ticker.toUpperCase(),
    shares,
    entry_price,
    entry_date,
    notes: notes || null,
    status: 'OPEN',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
