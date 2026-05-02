import React from 'react';
import { Bell, Search, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const Topbar: React.FC = () => {
  const { currentUser, settings, updateSettings } = useStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[var(--bg-main)]/50 backdrop-blur-xl border-b border-[var(--border-color)] sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-black text-primary uppercase tracking-tighter italic lg:hidden">RetailFlow</h1>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl w-64 group focus-within:border-primary/50 transition-all">
          <Search size={16} className="text-[var(--text-muted)] group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search terminal..." 
            className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-[var(--text-muted)]/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-primary hover:border-primary/20 transition-all active:scale-95"
        >
          {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-primary hover:border-primary/20 transition-all active:scale-95 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)] animate-pulse"></span>
        </button>

        <div className="h-10 w-[1px] bg-[var(--border-color)] hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-[var(--text-main)] leading-none uppercase tracking-widest">{currentUser?.name || 'Authorized Admin'}</p>
            <p className="text-[8px] font-bold text-primary leading-none uppercase tracking-[0.2em] mt-1.5 opacity-70">Security Level 4</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center text-primary font-black shadow-lg shadow-primary/5">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
