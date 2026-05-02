import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

interface AuthProps {
  mode: 'login' | 'signup';
  onToggle: () => void;
  onSuccess: () => void;
}

export function Auth({ mode, onToggle, onSuccess }: AuthProps) {
  const { login, settings } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('admin@workdesk.com');
  const [password, setPassword] = React.useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      login(email);
      setLoading(false);
      onSuccess();
    }, 800);
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-8 transition-colors duration-500",
      theme === 'dark' ? "bg-slate-950" : "bg-slate-50"
    )}>
      {/* Background Orbs */}
      <div className="fixed top-[10%] right-[10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" style={{ backgroundColor: `${primaryColor}10` }} />
      <div className="fixed bottom-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px ${primaryColor}40` }}
          >
            <Building2 className="text-white w-8 h-8" />
          </motion.div>
          <h2 className={cn("text-4xl font-black mb-3 uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 font-medium normal-case tracking-normal">
            {mode === 'login' ? 'System access authorization portal' : 'Register new administrative credentials'}
          </p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-all border"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@workdesk.com"
                  className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-all border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest hover:opacity-80" style={{ color: primaryColor }}>Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-all border"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded-md text-primary focus:ring-primary cursor-pointer" defaultChecked />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">Remember this session</label>
            </div>

            <button
              disabled={loading}
              className="w-full font-black py-5 rounded-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 text-white"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px ${primaryColor}40` }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Authorize Access' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <button 
            onClick={onToggle}
            className="w-full mt-8 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-colors"
            style={{ '--tw-text-opacity': '1' } as any}
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
          <ShieldCheck className="w-6 h-6 text-slate-500" />
          <div className="h-4 w-px bg-slate-500/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">End-to-End Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
