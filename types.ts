
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
