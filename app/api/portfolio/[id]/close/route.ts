// app/api/portfolio/[id]/close/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const { exit_price, exit_date } = body;

  if (!exit_price || !exit_date) {
    return NextResponse.json({ error: 'Missing exit_price or exit_date' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('portfolio_positions')
    .update({ status: 'CLOSED', exit_price, exit_date })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
