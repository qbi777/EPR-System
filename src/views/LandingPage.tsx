import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowRight, Shield, Zap, LayoutDashboard, Database, CreditCard } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-[#020617] shadow-lg shadow-cyan-500/20">
            <ShoppingCart size={22} />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">RetailFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-[var(--text-muted)] hover:text-primary transition-colors">Features</a>
          <a href="#solutions" className="text-sm font-medium text-[var(--text-muted)] hover:text-primary transition-colors">Solutions</a>
          <button 
            onClick={onStart}
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
              <Zap size={12} fill="currentColor" /> Next-Gen Retail ERP
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
              Streamline your <br />
              <span className="text-primary italic">Retail Empire.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] mb-10 max-w-lg leading-relaxed font-medium">
              A high-velocity ERP system built for modern commerce. Manage inventory, process sales, and audit your financials with precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-primary text-[#020617] rounded-full font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 active:scale-95 group"
              >
                Launch App <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-black text-sm hover:bg-white/10 transition-all active:scale-95">
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square cyber-card p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:opacity-100 transition-opacity" />
              <div className="h-full w-full rounded-2xl bg-[#020617]/50 border border-white/5 p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Tracking</p>
                      <h3 className="text-2xl font-bold">Stock Inventory</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Database size={24} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-white/5 rounded-xl border border-white/5 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-primary/20" />
                          <div className="w-24 h-2 bg-white/10 rounded-full" />
                        </div>
                        <div className="w-12 h-2 bg-primary/20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Revenue Today</p>
                      <p className="text-3xl font-black text-white">$42,910.00</p>
                    </div>
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-[#020617] bg-[var(--bg-card)] flex items-center justify-center">
                          <span className="text-[10px] font-black">U{i}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floaties */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute -top-10 -right-10 px-6 py-4 cyber-card border-primary/20 text-primary font-black flex items-center gap-3 shadow-2xl"
            >
              <Zap size={20} fill="currentColor" /> High Performance
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -left-10 px-6 py-4 cyber-card border-blue-500/20 text-blue-400 font-black flex items-center gap-3 shadow-2xl"
            >
              <Shield size={20} fill="currentColor" /> Full SSL Secure
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Social Proof */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <p className="text-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-12">Trusted by 2,000+ Enterprises Globally</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
           <Zap size={32} />
           <Shield size={32} />
           <LayoutDashboard size={32} />
           <Database size={32} />
           <CreditCard size={32} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
