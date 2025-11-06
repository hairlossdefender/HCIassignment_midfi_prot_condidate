
import { Asset, Transaction, Stock, OwnedStock, ForexRate, ForexHistoryPoint } from '../types';

export const mockOwnedStocks: OwnedStock[] = [
  { symbol: '005930', name: '삼성전자', price: 83000, change: 1200, changePercent: 1.47, quantity: 542 },
  { symbol: '035720', name: '카카오', price: 43000, change: -500, changePercent: -1.15, quantity: 116 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 340000, change: 12000, changePercent: 3.70, quantity: 15 }
];

const totalStockValue = mockOwnedStocks.reduce((sum, stock) => sum + (stock.price * stock.quantity), 0);

export const mockAssets: Asset[] = [
  { name: '주식 포트폴리오', value: totalStockValue, category: 'Stocks' },
  { name: '서울 아파트', value: 850000000, category: 'Real Estate' },
  { name: '달러 예금', value: 35000000, category: 'Cash' },
  { name: '비트코인', value: 15000000, category: 'Crypto' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', date: '2024-07-22', description: '월급', amount: 5000000, type: 'income' },
  { id: 't2', date: '2024-07-21', description: '넷플릭스 구독', amount: -17000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't3', date: '2024-07-20', description: '주식 매수 (삼성전자)', amount: -1000000, type: 'expense', expenseCategory: 'variable' },
  { id: 't4', date: '2024-07-19', description: '마트 장보기', amount: -150000, type: 'expense', expenseCategory: 'variable' },
  { id: 't5', date: '2024-07-15', description: '관리비', amount: -250000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't6', date: '2024-07-14', description: '교통비', amount: -55000, type: 'expense', expenseCategory: 'variable' },
  { id: 't7', date: '2024-07-12', description: '보험료', amount: -120000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't8', date: '2024-07-10', description: '외식', amount: -85000, type: 'expense', expenseCategory: 'variable' },
  { id: 't9', date: '2024-07-01', description: '월세', amount: -750000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't10', date: '2024-06-22', description: '프리랜서 수입', amount: 800000, type: 'income' },
];

export const mockStocks: { [key: string]: Stock } = {
  '005930': { symbol: '005930', name: '삼성전자', price: 83000, change: 1200, changePercent: 1.47 },
  '035720': { symbol: '035720', name: '카카오', price: 43000, change: -500, changePercent: -1.15 },
  'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.50, change: 8.75, changePercent: 3.70 },
};

export const mockForexRates: { [key: string]: ForexRate } = {
    'USD/KRW': { pair: 'USD/KRW', name: 'US Dollar / Korean Won', rate: 1385.50, change: 2.30, changePercent: 0.17 },
    'EUR/KRW': { pair: 'EUR/KRW', name: 'Euro / Korean Won', rate: 1482.10, change: -1.50, changePercent: -0.10 },
    'JPY/KRW': { pair: 'JPY/KRW', name: 'Japanese Yen (100) / Korean Won', rate: 880.45, change: 0.95, changePercent: 0.11 },
};
  
export const mockForexHistory: { [key: string]: ForexHistoryPoint[] } = {
    'USD/KRW': [
      { date: '7-15', rate: 1380.2 },
      { date: '7-16', rate: 1382.5 },
      { date: '7-17', rate: 1381.0 },
      { date: '7-18', rate: 1384.8 },
      { date: '7-19', rate: 1383.2 },
      { date: '7-20', rate: 1385.1 },
      { date: '7-21', rate: 1385.5 },
    ],
    'EUR/KRW': [
      { date: '7-15', rate: 1485.6 },
      { date: '7-16', rate: 1483.2 },
      { date: '7-17', rate: 1484.0 },
      { date: '7-18', rate: 1481.5 },
      { date: '7-19', rate: 1483.6 },
      { date: '7-20', rate: 1482.9 },
      { date: '7-21', rate: 1482.1 },
    ],
    'JPY/KRW': [
      { date: '7-15', rate: 878.1 },
      { date: '7-16', rate: 879.5 },
      { date: '7-17', rate: 879.0 },
      { date: '7-18', rate: 880.2 },
      { date: '7-19', rate: 879.5 },
      { date: '7-20', rate: 880.0 },
      { date: '7-21', rate: 880.45 },
    ],
};