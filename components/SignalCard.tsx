// components/SignalCard.tsx
import { BuySignal } from '@/types';

export default function SignalCard({ signal }: { signal: BuySignal }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 mb-4 border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{signal.ticker}</h3>
        <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
          Rank {signal.tomorrow_buy_rank?.toFixed(1) ?? '-'}
        </span>
      </div>
      {signal.company && <p className="text-gray-500 text-sm mb-2">{signal.company}</p>}
      <div className="text-sm text-gray-700 space-y-1 mb-3">
        <p>
          Price: <span className="font-medium">${signal.current_price?.toFixed(2) ?? '-'}</span>
          {'   '}EW Score: <span className="font-medium">{signal.ew_score?.toFixed(0) ?? '-'}</span>
          {'   '}Dow Score: <span className="font-medium">{signal.dow_ma_score ?? '-'}/3</span>
        </p>
        <p className="font-semibold">State: {signal.elliott_state ?? '-'}</p>
        <p>OBV: {signal.obv_divergence ?? '-'}</p>
      </div>
      <span className="inline-block bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
        {signal.recommended_action ?? 'Buy / Build Position'}
      </span>
      {signal.key_signals && (
        <p className="text-xs text-gray-500 mt-3">{signal.key_signals}</p>
      )}
    </div>
  );
}
