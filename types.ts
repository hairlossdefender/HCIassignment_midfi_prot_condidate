
export interface SurveyScores {
  impulsivity: number;
  financialInterest: number;
  comprehension: number;
}

export interface UserProfile {
  name: string;
  scores: SurveyScores;
  systemInstruction: string;
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  data?: any;
}

export interface Asset {
  name:string;
  value: number;
  category: 'Stocks' | 'Real Estate' | 'Cash' | 'Crypto';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  expenseCategory?: 'fixed' | 'variable';
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface OwnedStock extends Stock {
  quantity: number;
}

export interface ForexRate {
  pair: string;
  name: string;
  rate: number;
  change: number;
  changePercent: number;
}

export interface ForexHistoryPoint {
  date: string;
  rate: number;
}

export interface FinancialTip {
  title: string;
  content: string;
}

// 로그인 및 사용자 정보
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profile?: UserExtendedProfile;
}

export interface UserExtendedProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  incomeLevel?: 'low' | 'medium' | 'high';
  fixedIncome?: number; // 고정 수입
  investmentExperience?: 'none' | 'beginner' | 'intermediate' | 'advanced';
  investmentGoal?: 'profit' | 'stability' | 'balanced';
  investmentPeriod?: 'short' | 'medium' | 'long';
  savingsAmount?: number;
  consumptionHabits?: string;
}

// 가상 주식 거래소
export interface VirtualAccount {
  id: string;
  userId: string;
  balance: number; // 가용 현금
  initialBalance: number; // 초기 자본금
  totalValue: number; // 총 자산 (현금 + 보유 주식 평가액)
  createdAt: string;
}

export interface VirtualTransaction {
  id: string;
  accountId: string;
  stockSymbol: string;
  stockName: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number; // 거래 당시 가격
  totalAmount: number; // quantity * price
  date: string;
}

export interface VirtualPosition {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number; // 평균 매수가
  currentPrice: number; // 현재가
  totalCost: number; // 총 매수금액
  marketValue: number; // 현재 평가액
  profit: number; // 평가손익
  profitPercent: number; // 수익률
}

// 뉴스 및 리포트
export interface News {
  id: string;
  title: string;
  content: string;
  source: string;
  category: 'market' | 'company' | 'economy' | 'policy' | 'other';
  publishedAt: string;
  url?: string;
  relatedStocks?: string[]; // 관련 주식 종목 코드
}

export interface ResearchReport {
  id: string;
  title: string;
  summary: string;
  source: string; // 증권사 이름
  targetStock: string;
  targetPrice?: number;
  rating?: 'buy' | 'hold' | 'sell';
  publishedAt: string;
  url?: string;
}

// 투자 일기
export interface InvestmentDiary {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  stockSymbol?: string;
  stockName?: string;
  decisionReason: string; // 투자 결정 근거
  emotion?: 'excited' | 'anxious' | 'hopeful' | 'regretful' | 'confident' | 'neutral';
  tags?: string[];
  attachments?: {
    type: 'chart' | 'news' | 'screenshot';
    url: string;
    description?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// 알림
export interface Notification {
  id: string;
  userId: string;
  type: 'stock_price' | 'market_news' | 'report' | 'trade' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedData?: any; // 관련 데이터 (주식 코드, 뉴스 ID 등)
}

// 주가 차트 데이터
export interface StockChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 시장 상황 시뮬레이션
export type MarketScenario = 'normal' | 'crash' | 'correction' | 'dead_cat_bounce' | 'bear_market' | 'bull_market';

export interface MarketScenarioConfig {
  scenario: MarketScenario;
  name: string;
  description: string;
  priceMultiplier: number; // 가격 변동 배수
  volatility: number; // 변동성 (0-1)
}
