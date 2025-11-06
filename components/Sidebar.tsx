
import React from 'react';
import { View } from '../App';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
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


const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems: { id: View; label: string; icon: React.FC }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'transactions', label: 'Transactions', icon: TransactionsIcon },
    { id: 'stocks', label: 'Stocks', icon: StocksIcon },
    { id: 'forex', label: 'Foreign Exchange', icon: ForexIcon },
    { id: 'chat', label: 'AI Chat', icon: ChatIcon },
  ];

  return (
    <nav className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-color-light dark:border-border-color-dark flex flex-col p-4">
        <div className="mb-10 px-2">
            <h1 className="text-2xl font-extrabold text-brand-primary dark:text-brand-primary-light">FinAgent</h1>
            <p className="text-sm text-on-surface-secondary">AI Financial Assistant</p>
        </div>
        <div className="flex flex-col space-y-2">
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
    </nav>
  );
};

export default Sidebar;
