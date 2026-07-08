// app/portfolio/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { PortfolioPosition } from '@/types';

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/portfolio');
    const data = await res.json();
    setPositions(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  async function handleAdd(form: FormData) {
    const body = {
      ticker: form.get('ticker'),
      shares: parseFloat(form.get('shares') as string),
      entry_price: parseFloat(form.get('entry_price') as string),
      entry_date: form.get('entry_date'),
      notes: form.get('notes'),
    };
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setShowAddForm(false);
    fetchPositions();
  }

  async function handleClose(id: number, currentPrice: number | null) {
    const exitPriceStr = window.prompt(
      'Exit price:',
      currentPrice ? currentPrice.toFixed(2) : ''
    );
    if (!exitPriceStr) return;
    const exit_price = parseFloat(exitPriceStr);
    if (isNaN(exit_price)) return;

    await fetch(`/api/portfolio/${id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exit_price, exit_date: new Date().toISOString().split('T')[0] }),
    });
    fetchPositions();
  }

  const totalCost = positions.reduce((s, p) => s + (p.cost_basis ?? 0), 0);
  const totalValue = positions.reduce((s, p) => s + (p.market_value ?? 0), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isProfit = totalPnl >= 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Portfolio</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          {showAddForm ? 'Cancel' : '+ Add Position'}
        </button>
      </div>

      {showAddForm && (
        <form
          action={handleAdd}
          className="bg-white rounded-xl shadow p-5 mb-6 border border-gray-100 grid grid-cols-2 gap-3"
        >
          <input name="ticker" placeholder="Ticker (e.g. AAPL)" required className="border rounded px-3 py-2 col-span-1" />
          <input name="shares" type="number" step="any" placeholder="Shares" required className="border rounded px-3 py-2 col-span-1" />
          <input name="entry_price" type="number" step="any" placeholder="Entry Price" required className="border rounded px-3 py-2 col-span-1" />
          <input name="entry_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="border rounded px-3 py-2 col-span-1" />
          <input name="notes" placeholder="Notes (optional)" className="border rounded px-3 py-2 col-span-2" />
          <button type="submit" className="col-span-2 bg-green-700 text-white rounded py-2 font-medium hover:bg-green-800">
            Save Position
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading...</p>
      ) : positions.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No open positions. Click + Add Position to start.</p>
      ) : (
        <>
          <div className={`rounded-xl shadow p-5 mb-6 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
            <h2 className="font-bold text-lg mb-2">Portfolio Summary</h2>
            <div className="flex justify-between text-sm mb-1">
              <span>Cost Basis: ${totalCost.toFixed(2)}</span>
              <span>Market Value: ${totalValue.toFixed(2)}</span>
            </div>
            <p className={`text-xl font-bold ${isProfit ? 'text-green-800' : 'text-red-800'}`}>
              {isProfit ? '+' : ''}${totalPnl.toFixed(2)} ({isProfit ? '+' : ''}{totalPnlPct.toFixed(2)}%)
            </p>
          </div>

          {positions.map((p) => {
            const pnl = p.unrealized_pnl ?? 0;
            const pnlPct = p.unrealized_pnl_pct ?? 0;
            const posProfit = pnl >= 0;
            return (
              <div key={p.id} className="bg-white rounded-xl shadow p-5 mb-4 border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold">{p.ticker}</h3>
                  <button
                    onClick={() => handleClose(p.id, p.current_price)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Close Position
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {p.shares} shares @ ${p.entry_price.toFixed(2)} ({p.entry_date})
                </p>
                {p.current_price && (
                  <p className="text-sm text-gray-600">Current: ${p.current_price.toFixed(2)}</p>
                )}
                <p className={`font-bold mt-2 ${posProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {posProfit ? '+' : ''}${pnl.toFixed(2)} ({posProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
                </p>
                {p.notes && <p className="text-xs text-gray-500 mt-2">{p.notes}</p>}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
