// types/index.ts

export interface BuySignal {
  id: number;
  scan_date: string;
  ticker: string;
  company: string | null;
  sector: string | null;
  sub_industry: string | null;
  timeframe: string | null;
  current_price: number | null;
  tomorrow_buy_rank: number | null;
  ew_score: number | null;
  trade_quality: string | null;
  elliott_state: string | null;
  dow_ma_score: number | null;
  obv_divergence: string | null;
  macd_signal: string | null;
  ideal_entry_price: number | null;
  pct_to_ideal_entry: number | null;
  pullback_buy_zone: string | null;
  stop_loss: number | null;
  pct_to_stop: number | null;
  current_wave_target: number | null;
  pct_to_target: number | null;
  extension_target: number | null;
  recommended_action: string | null;
  beginner_note: string | null;
  key_signals: string | null;
  universe: string;
}

export interface PortfolioPosition {
  id: number;
  ticker: string;
  shares: number;
  entry_price: number;
  entry_date: string;
  notes: string | null;
  status: string;
  current_price: number | null;
  price_date: string | null;
  unrealized_pnl: number | null;
  unrealized_pnl_pct: number | null;
  cost_basis: number | null;
  market_value: number | null;
}

export interface PortfolioHistoryRow {
  id: number;
  ticker: string;
  shares: number;
  entry_price: number;
  entry_date: string;
  exit_price: number;
  exit_date: string;
  realized_pnl: number;
  realized_pnl_pct: number;
  notes: string | null;
}
