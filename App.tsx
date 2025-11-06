
import React from 'react';
import { useState, useEffect } from 'react';
import { UserProfile, SurveyScores } from './types';
import Survey from './components/Survey';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import StocksPage from './pages/Stocks';
import AIChatPage from './pages/AIChat';
import ForexPage from './pages/Forex';
import { createSystemInstruction } from './services/geminiService';

export type View = 'dashboard' | 'transactions' | 'stocks' | 'forex' | 'chat';

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');


  useEffect(() => {
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

  const handleSurveyComplete = (scores: SurveyScores) => {
    const systemInstruction = createSystemInstruction(scores);
    setUserProfile({
      name: '사용자', // This could be collected in a previous step
      scores,
      systemInstruction,
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const viewTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transaction History',
    stocks: 'Stock Market',
    forex: 'Foreign Exchange',
    chat: 'AI Financial Agent'
  }

  const renderContent = () => {
    if (!userProfile) return null;

    switch(activeView) {
      case 'dashboard':
        return <DashboardPage userProfile={userProfile} />;
      case 'transactions':
        return <TransactionsPage />;
      case 'stocks':
        return <StocksPage />;
      case 'forex':
        return <ForexPage />;
      case 'chat':
        return <AIChatPage userProfile={userProfile} />;
      default:
        return <DashboardPage userProfile={userProfile} />;
    }
  }

  return (
    <div className="antialiased bg-background-light dark:bg-background-dark text-on-surface dark:text-on-surface">
      {!userProfile ? (
        <Survey onComplete={handleSurveyComplete} />
      ) : (
        <div className="flex h-screen">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          <div className="flex-1 flex flex-col overflow-hidden">
             <header className="flex justify-between items-center px-6 py-4 border-b border-border-color-light dark:border-border-color-dark bg-surface-light dark:bg-surface-dark/80 backdrop-blur-sm">
                <h1 className="text-2xl font-bold text-on-surface dark:text-on-surface">{viewTitles[activeView]}</h1>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full text-on-surface-secondary dark:text-on-surface-secondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle dark mode"
                >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button>
            </header>
            <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
              {renderContent()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
