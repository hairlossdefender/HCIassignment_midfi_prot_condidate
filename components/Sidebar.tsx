
import React from 'react';
import { View } from '../App';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout?: () => void;
}

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const TransactionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const StocksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ForexIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m0 18a9 9 0 00-9-9m9-9h.01M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5-2.986-7C3.986 5 3 8 3 10c0 4.418 3.582 8 8 8h5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.343 17.343A7.975 7.975 0 0115 11c0-2-.5-5-2.986-7C9.986 6 9 9 9 11c0 3.314 2.686 6 6 6h2.343" />
    </svg>
);

const VirtualTradingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const DiaryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const NewsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);


const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-primary text-white dark:bg-brand-primary-dark'
          : 'text-on-surface-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="text-base font-semibold">{label}</span>
    </button>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout }) => {
  const navItems: { id: View; label: string; icon: React.FC }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'transactions', label: 'Transactions', icon: TransactionsIcon },
    { id: 'stocks', label: 'Stocks', icon: StocksIcon },
    { id: 'forex', label: 'Foreign Exchange', icon: ForexIcon },
    { id: 'virtual-trading', label: 'Virtual Trading', icon: VirtualTradingIcon },
    { id: 'news', label: 'News & Reports', icon: NewsIcon },
    { id: 'diary', label: 'Investment Diary', icon: DiaryIcon },
    { id: 'chat', label: 'AI Chat', icon: ChatIcon },
  ];

  return (
    <nav className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-color-light dark:border-border-color-dark flex flex-col p-4">
        <div className="mb-10 px-2">
            <h1 className="text-2xl font-extrabold text-brand-primary dark:text-brand-primary-light">FinAgent</h1>
            <p className="text-sm text-on-surface-secondary">AI Financial Assistant</p>
        </div>
        <div className="flex flex-col space-y-2 flex-1">
            {navItems.map(item => (
                <NavItem 
                    key={item.id}
                    label={item.label}
                    icon={<item.icon />}
                    isActive={activeView === item.id}
                    onClick={() => setActiveView(item.id)}
                />
            ))}
        </div>
        {onLogout && (
            <div className="mt-auto pt-4 border-t border-border-color-light dark:border-border-color-dark">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogoutIcon />
                    <span className="text-base font-semibold">Logout</span>
                </button>
            </div>
        )}
    </nav>
  );
};

export default Sidebar;
