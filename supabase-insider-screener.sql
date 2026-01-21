-- Insider Screener 테이블 생성
CREATE TABLE IF NOT EXISTS insider_screener (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  company_name TEXT,
  insider_name TEXT,
  transaction_date TEXT NOT NULL,
  shares NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (빠른 조회)
CREATE INDEX IF NOT EXISTS idx_insider_screener_symbol ON insider_screener(symbol);
CREATE INDEX IF NOT EXISTS idx_insider_screener_value ON insider_screener(value DESC);
CREATE INDEX IF NOT EXISTS idx_insider_screener_created_at ON insider_screener(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE insider_screener ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read insider_screener"
  ON insider_screener
  FOR SELECT
  USING (true);
