interface StockInfo {
  symbol: string;
  nameEn: string;
  nameKr: string;
  aliases?: string[];
}

export const KOREAN_STOCK_MAP: StockInfo[] = [
  { symbol: 'AAPL', nameEn: 'Apple Inc', nameKr: '애플', aliases: ['아이폰', '맥북'] },
  { symbol: 'MSFT', nameEn: 'Microsoft Corporation', nameKr: '마이크로소프트', aliases: ['MS', '엠에스'] },
  { symbol: 'GOOGL', nameEn: 'Alphabet Inc', nameKr: '알파벳', aliases: ['구글', '유튜브'] },
  { symbol: 'GOOG', nameEn: 'Alphabet Inc Class C', nameKr: '알파벳C', aliases: ['구글C'] },
  { symbol: 'AMZN', nameEn: 'Amazon.com Inc', nameKr: '아마존', aliases: ['아마존닷컴'] },
  { symbol: 'NVDA', nameEn: 'NVIDIA Corporation', nameKr: '엔비디아', aliases: ['엔비디아'] },
  { symbol: 'META', nameEn: 'Meta Platforms Inc', nameKr: '메타', aliases: ['페이스북', '인스타그램', '메타플랫폼'] },
  { symbol: 'TSLA', nameEn: 'Tesla Inc', nameKr: '테슬라', aliases: ['테슬라모터스'] },
  { symbol: 'BRK.B', nameEn: 'Berkshire Hathaway Inc', nameKr: '버크셔해서웨이', aliases: ['버크셔'] },
  { symbol: 'TSM', nameEn: 'Taiwan Semiconductor', nameKr: '대만반도체', aliases: ['TSMC', '타이완반도체'] },
  
  { symbol: 'JPM', nameEn: 'JPMorgan Chase & Co', nameKr: '제이피모건', aliases: ['JP모건', '체이스'] },
  { symbol: 'V', nameEn: 'Visa Inc', nameKr: '비자', aliases: ['비자카드'] },
  { symbol: 'JNJ', nameEn: 'Johnson & Johnson', nameKr: '존슨앤존슨', aliases: ['J&J', '존슨'] },
  { symbol: 'WMT', nameEn: 'Walmart Inc', nameKr: '월마트' },
  { symbol: 'PG', nameEn: 'Procter & Gamble Co', nameKr: '피앤지', aliases: ['P&G', '프록터앤갬블'] },
  { symbol: 'MA', nameEn: 'Mastercard Inc', nameKr: '마스터카드' },
  { symbol: 'UNH', nameEn: 'UnitedHealth Group', nameKr: '유나이티드헬스' },
  { symbol: 'HD', nameEn: 'Home Depot Inc', nameKr: '홈디포' },
  { symbol: 'DIS', nameEn: 'Walt Disney Co', nameKr: '디즈니', aliases: ['월트디즈니'] },
  { symbol: 'PYPL', nameEn: 'PayPal Holdings Inc', nameKr: '페이팔' },
  
  { symbol: 'BAC', nameEn: 'Bank of America Corp', nameKr: '뱅크오브아메리카', aliases: ['BOA', '뱅오아'] },
  { symbol: 'ADBE', nameEn: 'Adobe Inc', nameKr: '어도비', aliases: ['포토샵'] },
  { symbol: 'CRM', nameEn: 'Salesforce Inc', nameKr: '세일즈포스' },
  { symbol: 'NFLX', nameEn: 'Netflix Inc', nameKr: '넷플릭스' },
  { symbol: 'COST', nameEn: 'Costco Wholesale Corp', nameKr: '코스트코' },
  { symbol: 'PFE', nameEn: 'Pfizer Inc', nameKr: '화이자' },
  { symbol: 'TMO', nameEn: 'Thermo Fisher Scientific', nameKr: '써모피셔' },
  { symbol: 'CSCO', nameEn: 'Cisco Systems Inc', nameKr: '시스코' },
  { symbol: 'ABT', nameEn: 'Abbott Laboratories', nameKr: '애보트' },
  { symbol: 'ORCL', nameEn: 'Oracle Corporation', nameKr: '오라클' },
  
  { symbol: 'NKE', nameEn: 'Nike Inc', nameKr: '나이키' },
  { symbol: 'PEP', nameEn: 'PepsiCo Inc', nameKr: '펩시', aliases: ['펩시코'] },
  { symbol: 'KO', nameEn: 'Coca-Cola Co', nameKr: '코카콜라', aliases: ['코크'] },
  { symbol: 'MRK', nameEn: 'Merck & Co Inc', nameKr: '머크' },
  { symbol: 'INTC', nameEn: 'Intel Corporation', nameKr: '인텔' },
  { symbol: 'AMD', nameEn: 'Advanced Micro Devices', nameKr: '에이엠디', aliases: ['AMD'] },
  { symbol: 'QCOM', nameEn: 'Qualcomm Inc', nameKr: '퀄컴' },
  { symbol: 'TXN', nameEn: 'Texas Instruments', nameKr: '텍사스인스트루먼트' },
  { symbol: 'AVGO', nameEn: 'Broadcom Inc', nameKr: '브로드컴' },
  { symbol: 'MU', nameEn: 'Micron Technology', nameKr: '마이크론' },
  
  { symbol: 'T', nameEn: 'AT&T Inc', nameKr: '에이티앤티', aliases: ['AT&T'] },
  { symbol: 'VZ', nameEn: 'Verizon Communications', nameKr: '버라이즌' },
  { symbol: 'CMCSA', nameEn: 'Comcast Corporation', nameKr: '컴캐스트' },
  { symbol: 'TMUS', nameEn: 'T-Mobile US Inc', nameKr: '티모바일' },
  { symbol: 'XOM', nameEn: 'Exxon Mobil Corp', nameKr: '엑슨모빌' },
  { symbol: 'CVX', nameEn: 'Chevron Corporation', nameKr: '쉐브론', aliases: ['셰브론'] },
  { symbol: 'COP', nameEn: 'ConocoPhillips', nameKr: '코노코필립스' },
  { symbol: 'SLB', nameEn: 'Schlumberger NV', nameKr: '슐럼버거' },
  { symbol: 'LLY', nameEn: 'Eli Lilly and Co', nameKr: '일라이릴리', aliases: ['릴리'] },
  { symbol: 'ABBV', nameEn: 'AbbVie Inc', nameKr: '애브비' },
  
  { symbol: 'UPS', nameEn: 'United Parcel Service', nameKr: '유피에스', aliases: ['UPS'] },
  { symbol: 'FDX', nameEn: 'FedEx Corporation', nameKr: '페덱스' },
  { symbol: 'CAT', nameEn: 'Caterpillar Inc', nameKr: '캐터필러' },
  { symbol: 'DE', nameEn: 'Deere & Company', nameKr: '디어', aliases: ['존디어'] },
  { symbol: 'BA', nameEn: 'Boeing Co', nameKr: '보잉' },
  { symbol: 'RTX', nameEn: 'RTX Corporation', nameKr: '레이시온', aliases: ['레이시온테크놀로지'] },
  { symbol: 'LMT', nameEn: 'Lockheed Martin Corp', nameKr: '록히드마틴' },
  { symbol: 'GE', nameEn: 'General Electric Co', nameKr: '제너럴일렉트릭', aliases: ['GE'] },
  { symbol: 'HON', nameEn: 'Honeywell International', nameKr: '하니웰' },
  { symbol: 'MMM', nameEn: '3M Company', nameKr: '쓰리엠', aliases: ['3M'] },
  
  { symbol: 'SBUX', nameEn: 'Starbucks Corporation', nameKr: '스타벅스' },
  { symbol: 'MCD', nameEn: 'McDonald\'s Corp', nameKr: '맥도날드', aliases: ['맥날'] },
  { symbol: 'YUM', nameEn: 'Yum! Brands Inc', nameKr: '얌브랜즈', aliases: ['KFC', '피자헛'] },
  { symbol: 'CMG', nameEn: 'Chipotle Mexican Grill', nameKr: '치폴레' },
  { symbol: 'DPZ', nameEn: 'Domino\'s Pizza Inc', nameKr: '도미노피자' },
  { symbol: 'GM', nameEn: 'General Motors Co', nameKr: '제너럴모터스', aliases: ['GM'] },
  { symbol: 'F', nameEn: 'Ford Motor Co', nameKr: '포드' },
  { symbol: 'TM', nameEn: 'Toyota Motor Corp', nameKr: '도요타', aliases: ['토요타'] },
  { symbol: 'HMC', nameEn: 'Honda Motor Co', nameKr: '혼다' },
  { symbol: 'RIVN', nameEn: 'Rivian Automotive', nameKr: '리비안' },
  
  { symbol: 'PLTR', nameEn: 'Palantir Technologies', nameKr: '팔란티어' },
  { symbol: 'SNOW', nameEn: 'Snowflake Inc', nameKr: '스노우플레이크' },
  { symbol: 'UBER', nameEn: 'Uber Technologies', nameKr: '우버' },
  { symbol: 'LYFT', nameEn: 'Lyft Inc', nameKr: '리프트' },
  { symbol: 'ABNB', nameEn: 'Airbnb Inc', nameKr: '에어비앤비' },
  { symbol: 'COIN', nameEn: 'Coinbase Global Inc', nameKr: '코인베이스' },
  { symbol: 'SQ', nameEn: 'Block Inc', nameKr: '블록', aliases: ['스퀘어'] },
  { symbol: 'SHOP', nameEn: 'Shopify Inc', nameKr: '쇼피파이' },
  { symbol: 'RBLX', nameEn: 'Roblox Corporation', nameKr: '로블록스' },
  { symbol: 'SNAP', nameEn: 'Snap Inc', nameKr: '스냅', aliases: ['스냅챗'] },
  
  { symbol: 'SPOT', nameEn: 'Spotify Technology', nameKr: '스포티파이' },
  { symbol: 'ZM', nameEn: 'Zoom Video Communications', nameKr: '줌', aliases: ['줌비디오'] },
  { symbol: 'DOCU', nameEn: 'DocuSign Inc', nameKr: '도큐사인' },
  { symbol: 'CRWD', nameEn: 'CrowdStrike Holdings', nameKr: '크라우드스트라이크' },
  { symbol: 'NET', nameEn: 'Cloudflare Inc', nameKr: '클라우드플레어' },
  { symbol: 'DDOG', nameEn: 'Datadog Inc', nameKr: '데이터독' },
  { symbol: 'MDB', nameEn: 'MongoDB Inc', nameKr: '몽고디비' },
  { symbol: 'NOW', nameEn: 'ServiceNow Inc', nameKr: '서비스나우' },
  { symbol: 'WDAY', nameEn: 'Workday Inc', nameKr: '워크데이' },
  { symbol: 'TEAM', nameEn: 'Atlassian Corporation', nameKr: '아틀라시안' },
  
  { symbol: 'BABA', nameEn: 'Alibaba Group', nameKr: '알리바바' },
  { symbol: 'JD', nameEn: 'JD.com Inc', nameKr: '징동', aliases: ['JD닷컴'] },
  { symbol: 'PDD', nameEn: 'PDD Holdings Inc', nameKr: '핀둬둬', aliases: ['테무'] },
  { symbol: 'BIDU', nameEn: 'Baidu Inc', nameKr: '바이두' },
  { symbol: 'NIO', nameEn: 'NIO Inc', nameKr: '니오' },
  { symbol: 'XPEV', nameEn: 'XPeng Inc', nameKr: '샤오펑' },
  { symbol: 'LI', nameEn: 'Li Auto Inc', nameKr: '리오토' },
  
  { symbol: 'GS', nameEn: 'Goldman Sachs Group', nameKr: '골드만삭스' },
  { symbol: 'MS', nameEn: 'Morgan Stanley', nameKr: '모건스탠리' },
  { symbol: 'C', nameEn: 'Citigroup Inc', nameKr: '씨티그룹', aliases: ['씨티'] },
  { symbol: 'WFC', nameEn: 'Wells Fargo & Co', nameKr: '웰스파고' },
  { symbol: 'SCHW', nameEn: 'Charles Schwab Corp', nameKr: '찰스슈왑' },
  { symbol: 'BLK', nameEn: 'BlackRock Inc', nameKr: '블랙록' },
  { symbol: 'AXP', nameEn: 'American Express Co', nameKr: '아메리칸익스프레스', aliases: ['아멕스'] },
  
  { symbol: 'AMGN', nameEn: 'Amgen Inc', nameKr: '암젠' },
  { symbol: 'GILD', nameEn: 'Gilead Sciences Inc', nameKr: '길리어드' },
  { symbol: 'MRNA', nameEn: 'Moderna Inc', nameKr: '모더나' },
  { symbol: 'BIIB', nameEn: 'Biogen Inc', nameKr: '바이오젠' },
  { symbol: 'REGN', nameEn: 'Regeneron Pharmaceuticals', nameKr: '리제네론' },
  { symbol: 'VRTX', nameEn: 'Vertex Pharmaceuticals', nameKr: '버텍스' },
  
  { symbol: 'LOW', nameEn: 'Lowe\'s Companies', nameKr: '로우스' },
  { symbol: 'TGT', nameEn: 'Target Corporation', nameKr: '타겟' },
  { symbol: 'TJX', nameEn: 'TJX Companies Inc', nameKr: '티제이엑스', aliases: ['TJ맥스'] },
  { symbol: 'LULU', nameEn: 'Lululemon Athletica', nameKr: '룰루레몬' },
  { symbol: 'ETSY', nameEn: 'Etsy Inc', nameKr: '엣시' },
  { symbol: 'EBAY', nameEn: 'eBay Inc', nameKr: '이베이' },
  
  { symbol: 'ARM', nameEn: 'Arm Holdings', nameKr: '암홀딩스', aliases: ['ARM', '암'] },
  { symbol: 'SMCI', nameEn: 'Super Micro Computer', nameKr: '슈퍼마이크로', aliases: ['수퍼마이크로'] },
  { symbol: 'MRVL', nameEn: 'Marvell Technology', nameKr: '마벨' },
  { symbol: 'AMAT', nameEn: 'Applied Materials', nameKr: '어플라이드머티리얼즈' },
  { symbol: 'LRCX', nameEn: 'Lam Research Corp', nameKr: '램리서치' },
  { symbol: 'KLAC', nameEn: 'KLA Corporation', nameKr: '케이엘에이' },
  { symbol: 'ASML', nameEn: 'ASML Holding NV', nameKr: '에이에스엠엘', aliases: ['ASML'] },
];

export function searchKoreanStocks(query: string): StockInfo[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return KOREAN_STOCK_MAP.filter((stock) => {
    if (stock.nameKr.includes(normalizedQuery)) return true;
    if (stock.aliases?.some((alias) => alias.toLowerCase().includes(normalizedQuery))) return true;
    if (stock.symbol.toLowerCase().includes(normalizedQuery)) return true;
    if (stock.nameEn.toLowerCase().includes(normalizedQuery)) return true;
    return false;
  }).slice(0, 10);
}

export function hasKoreanCharacters(text: string): boolean {
  return /[가-힣]/.test(text);
}
