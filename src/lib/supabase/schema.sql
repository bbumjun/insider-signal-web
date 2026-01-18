-- Insider Transactions Cache
CREATE TABLE insider_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  filing_date DATE NOT NULL,
  owner_name TEXT NOT NULL,
  owner_title TEXT,
  transaction_type TEXT, -- P: Purchase, S: Sale
  shares BIGINT,
  price_per_share DECIMAL(10,2),
  total_value DECIMAL(15,2),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, filing_date, owner_name, transaction_type, shares)
);

-- Stock Prices Cache
CREATE TABLE stock_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  close DECIMAL(10,2),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, date)
);

-- News Cache
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  headline TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, url)
);

-- AI Insights Cache
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_insider_symbol_date ON insider_transactions(symbol, transaction_date DESC);
CREATE INDEX idx_prices_symbol_date ON stock_prices(symbol, date DESC);
CREATE INDEX idx_news_symbol_date ON news(symbol, published_at DESC);
CREATE INDEX idx_insights_symbol ON ai_insights(symbol);
