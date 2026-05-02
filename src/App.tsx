import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Plus, ShoppingCart, LayoutDashboard, Package, CalendarCheck, History,
  TrendingDown, Users, Settings, CreditCard
} from 'lucide-react';
import { cn } from './lib/utils';
import AuditLogWidget from './components/AuditLogWidget';

// Placeholder Views (will build these in next steps)
import Dashboard from './views/Dashboard';
import POS from './views/POS';
import Inventory from './views/Inventory';
import Purchases from './views/Purchases';
import Expenses from './views/Expenses';
import DayClosing from './views/DayClosing';
import UserManagement from './views/UserManagement';
import SettingsView from './views/SettingsView';
import LandingPage from './views/LandingPage';
import Auth from './views/Auth';

const AppContent: React.FC = () => {
  const { settings, currentUser, loading, logout: originalLogout } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  // Dynamic Theme Application
  React.useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    import('./constants').then(({ THEMES }) => {
      const theme = THEMES.find(t => t.id === settings.theme) || THEMES[0];
      root.style.setProperty('--color-primary', theme.primary);
      root.style.setProperty('--bg-main', settings.darkMode ? theme.bg : '#F8FAFC');
      root.style.setProperty('--glow-cyan', settings.darkMode 
        ? `0 0 20px ${theme.primary}33` 
        : `0 4px 12px rgba(0, 0, 0, 0.05)`);
    });
  }, [settings.darkMode, settings.theme]);

  const logout = async () => {
    await originalLogout();
    setShowLanding(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-[#020617] shadow-2xl animate-pulse">
            <ShoppingCart size={32} />
          </div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Initializing</div>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  if (!currentUser) {
    return <Auth onLogin={() => setShowLanding(false)} />;
  }
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'purchases': return <Purchases />;
      case 'expenses': return <Expenses />;
      case 'closing': return <DayClosing />;
      case 'users': return <UserManagement />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'purchases', label: 'Purchase', icon: CreditCard },
    { id: 'expenses', label: 'Expense', icon: TrendingDown },
    { id: 'closing', label: 'Closing', icon: CalendarCheck },
    { id: 'users', label: 'Team', icon: Users },
    { id: 'settings', label: 'Setup', icon: Settings },
  ];

  return (
    <div className={cn("flex min-h-screen", settings.darkMode ? "dark" : "light")}>
      <div className="flex w-full min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Topbar />
          
          <main className="flex-1 overflow-y-auto p-2 md:p-8 pb-24 md:pb-8 custom-scrollbar bg-[var(--bg-main)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto w-full relative"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Quick Add Floating Actions */}
          <div className="absolute bottom-20 md:bottom-6 right-6 flex flex-col md:flex-row gap-3 z-40">
             <button 
               onClick={() => setActiveTab('inventory')}
               className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-main)] shadow-lg hover:scale-105 transition-transform"
             >
              <Plus size={20} className="md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => setActiveTab('pos')}
              className="px-4 md:px-6 h-10 md:h-12 rounded-full bg-primary text-[#020617] font-bold shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all flex items-center gap-2 text-sm md:text-base"
            >
              <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Quick Sale</span>
              <span className="sm:hidden">Sale</span>
            </button>
          </div>

          {/* Mobile Bottom Nav - Scrollable */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] backdrop-blur-lg border-t border-[var(--border-color)] flex overflow-x-auto scrollbar-hide p-1 gap-1 z-50">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 min-w-[72px] rounded-xl transition-all",
                  activeTab === item.id ? "bg-primary/10 text-primary" : "text-[var(--text-muted)]"
                )}
              >
                <item.icon size={18} />
                <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
