import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Package, CreditCard, 
  TrendingDown, CalendarCheck, Users, Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useStore } from '../../context/StoreContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { company, logout } = useStore();

  const menuItems = [
// ... (omitting for brevity in thought, but I must include full ReplacementContent)
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart },
    { id: 'inventory', label: 'Stock Center', icon: Package },
    { id: 'purchases', label: 'Purchases', icon: CreditCard },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'closing', label: 'Operations', icon: CalendarCheck },
    { id: 'users', label: 'Teams', icon: Users },
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 220 }}
      className="hidden md:flex h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex-col relative z-50"
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={cn("flex items-center gap-4 overflow-hidden transition-all", isCollapsed ? "p-4 justify-center" : "p-6")}>
          <div className={cn(
            "rounded-2xl bg-primary flex-shrink-0 flex items-center justify-center font-bold text-[#020617] shadow-lg shadow-primary/20 transition-all",
            isCollapsed ? "w-10 h-10" : "w-10 h-10"
          )}>
            <ShoppingCart size={20} />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-black text-base tracking-tighter text-[var(--text-main)] uppercase leading-none truncate">
                {company.name}
              </span>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Retail Flow</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "nav-link w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all relative group h-11",
                activeTab === item.id ? "bg-primary/10 text-primary" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-primary/5",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-transform duration-300 flex-shrink-0",
                activeTab === item.id ? "scale-110" : "group-hover:scale-110"
              )} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-[9px] uppercase tracking-[0.2em] whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-indicator"
                  className={cn(
                    "absolute bg-primary shadow-[0_0_8px_var(--color-primary)]",
                    isCollapsed ? "left-0 w-1 h-5 rounded-r-full" : "right-1.5 w-1 h-1 rounded-full"
                  )}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 mt-auto">
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to exit the system?")) {
                logout().then(() => {
                  if (onLogout) onLogout();
                });
              }
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/5 transition-all active:scale-95 group",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            {!isCollapsed && <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-20 bg-primary rounded-r-2xl flex items-center justify-center text-[#020617] shadow-[5px_0_20px_rgba(34,211,238,0.4)] hover:w-12 transition-all z-50 border-y border-r border-white/20 active:scale-95 group before:absolute before:inset-0 before:rounded-r-2xl before:shadow-[0_0_15px_rgba(34,211,238,0.3)] before:animate-pulse"
      >
        {isCollapsed ? <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /> : <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
