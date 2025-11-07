
import React from 'react';
import { useState, useEffect } from 'react';
import { UserProfile, SurveyScores, User, UserExtendedProfile } from './types';
import Login from './pages/Login';
import UserProfileSetup from './components/UserProfileSetup';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import StocksPage from './pages/Stocks';
import AIChatPage from './pages/AIChat';
import ForexPage from './pages/Forex';
import VirtualTradingPage from './pages/VirtualTrading';
import InvestmentDiaryPage from './pages/InvestmentDiary';
import NewsReportsPage from './pages/NewsReports';
import FloatingChat from './components/FloatingChat';
import StockTickerBanner from './components/StockTickerBanner';
import { createSystemInstruction } from './services/geminiService';

export type View = 'dashboard' | 'transactions' | 'stocks' | 'forex' | 'virtual-trading' | 'diary' | 'news' | 'chat';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25c0 5.385 4.365 9.75 9.75 9.75 2.572 0 4.92-.99 6.697-2.643a.75.75 0 01.998.058l.75.75a.75.75 0 001.06-1.06l-.75-.75a.75.75 0 01-.058-.998z" />
  </svg>
);


function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    // 로그인 상태 확인
    const storedUser = localStorage.getItem('currentUser');
    const storedProfile = localStorage.getItem('userProfile');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setUserProfile(profile);
      } else {
        // 프로필이 없으면 설정 화면 표시
        setShowProfileSetup(true);
      }
    }

    // 다크 모드 설정
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUserProfile(profile);
    } else {
      setShowProfileSetup(true);
    }
  };

  const handleSignup = (user: User) => {
    setCurrentUser(user);
    setShowProfileSetup(true);
  };

  const handleProfileSetupComplete = (extendedProfile: UserExtendedProfile, scores: SurveyScores) => {
    const systemInstruction = createSystemInstruction(scores);
    const profile: UserProfile = {
      name: currentUser?.name || '사용자',
      scores,
      systemInstruction,
    };
    
    // 사용자 프로필에 확장 정보 추가
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        profile: extendedProfile,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // 고정 수입이 있으면 거래 내역에 자동 추가
      if (extendedProfile.fixedIncome && extendedProfile.fixedIncome > 0) {
        const existingTransactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.id}`) || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        // 이미 고정 수입이 있는지 확인
        const hasFixedIncome = existingTransactions.some((tx: any) => 
          tx.type === 'income' && tx.description === '월급' && tx.date === today
        );
        
        if (!hasFixedIncome) {
          const fixedIncomeTransaction = {
            id: `fixed_income_${Date.now()}`,
            date: today,
            description: '월급',
            amount: extendedProfile.fixedIncome,
            type: 'income' as const,
          };
          existingTransactions.unshift(fixedIncomeTransaction);
          localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(existingTransactions));
        }
      }
    }
    
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setShowProfileSetup(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setShowProfileSetup(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const viewTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transaction History',
    stocks: 'Stock Market',
    forex: 'Foreign Exchange',
    'virtual-trading': 'Virtual Trading',
    diary: 'Investment Diary',
    news: 'News & Reports',
    chat: 'AI Chat',
  };

  const renderContent = () => {
    if (!userProfile || !currentUser) return null;

    switch(activeView) {
      case 'dashboard':
        return <DashboardPage userProfile={userProfile} />;
      case 'transactions':
        return <TransactionsPage userId={currentUser.id} />;
      case 'stocks':
        return <StocksPage />;
      case 'forex':
        return <ForexPage />;
      case 'virtual-trading':
        return <VirtualTradingPage userId={currentUser.id} />;
      case 'diary':
        return <InvestmentDiaryPage userId={currentUser.id} />;
      case 'news':
        return <NewsReportsPage />;
      case 'chat':
        return <AIChatPage userProfile={userProfile} userId={currentUser.id} />;
      default:
        return <DashboardPage userProfile={userProfile} />;
    }
  };

  return (
    <div className="antialiased bg-background-light dark:bg-background-dark text-on-surface dark:text-on-surface">
      {!currentUser ? (
        <Login onLogin={handleLogin} onSignup={handleSignup} />
      ) : showProfileSetup ? (
        <UserProfileSetup 
          userName={currentUser.name} 
          onComplete={handleProfileSetupComplete}
        />
      ) : (
        <div className="flex h-screen">
          <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <StockTickerBanner />
             <header className="flex justify-between items-center px-6 py-4 border-b border-border-color-light dark:border-border-color-dark bg-surface-light dark:bg-surface-dark/80 backdrop-blur-sm">
                <h1 className="text-2xl font-bold text-on-surface dark:text-on-surface">{viewTitles[activeView]}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                    {currentUser.name}님
                  </span>
                  <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-full text-on-surface-secondary dark:text-on-surface-secondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                  </button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
              {renderContent()}
            </main>
          </div>
          {userProfile && (
            <FloatingChat 
              userProfile={userProfile} 
              userId={currentUser?.id}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
