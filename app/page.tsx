// app/page.tsx
// Server Component -- fetches fresh data on every request (dynamic rendering).
import { supabaseServer } from '@/lib/supabaseServerClient';
import { BuySignal } from '@/types';
import SignalCard from '@/components/SignalCard';

export const dynamic = 'force-dynamic'; // always fetch live data, no static caching
export const revalidate = 0;

async function getAvailableUniverses(): Promise<string[]> {
  const { data, error } = await supabaseServer
    .from('v_available_universes')
    .select('universe');

  if (error || !data) {
    console.error('Error fetching universes:', error?.message);
    return [];
  }
  return data.map((r: any) => r.universe as string);
}

async function getTop30ForUniverse(universe: string | null): Promise<BuySignal[]> {
  // universe === null means "All Indices" combined Top 30 (unfiltered, no state/quality filters)
  let query = supabaseServer
    .from(universe ? 'v_top_buy_signals_by_universe' : 'v_top_buy_signals')
    .select('*')
    .order('tomorrow_buy_rank', { ascending: false })
    .limit(30);

  if (universe) {
    query = query.eq('universe', universe);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching signals:', error.message);
    return [];
  }
  return data as BuySignal[];
}

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: { universe?: string };
}) {
  const activeUniverse = searchParams?.universe || null; // null = "All"
  const [universes, signals] = await Promise.all([
    getAvailableUniverses(),
    getTop30ForUniverse(activeUniverse),
  ]);

  const tabs = ['All', ...universes];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Top 30 Buy Candidates</h1>
        <span className="text-xs text-gray-400">Updates daily pre-market · No filters applied</span>
      </div>

      {/* Per-index tabs, one scan per index runs in parallel via GitHub Actions matrix */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isActive = tab === 'All' ? !activeUniverse : activeUniverse === tab;
          const href = tab === 'All' ? '/' : `/?universe=${tab}`;
          return (
            <a
              key={tab}
              href={href}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-400'
              }`}
            >
              {tab}
            </a>
          );
        })}
      </div>

      {signals.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          No scan data yet for this index. Check back after the next scan runs.
        </div>
      ) : (
        signals.map((s) => (
          <SignalCard key={`${s.ticker}-${s.timeframe}-${s.universe}`} signal={s} />
        ))
      )}
    </div>
  );
}
