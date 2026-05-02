import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, cn } from '../lib/utils';
import { TrendingDown, Plus, Search, Calendar, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import AuditLogWidget from '../components/AuditLogWidget';

const Expenses: React.FC = () => {
  const { expenses, addExpense, daySummaries } = useStore();
  const activeSession = daySummaries.find(d => !d.isClosed);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    category: 'Rent',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    addExpense(formData);
    setShowModal(false);
    setFormData({ title: '', amount: 0, category: 'Rent', notes: '' });
  };

  return (
    <div className="space-y-12 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {!activeSession && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-[2rem] flex items-center gap-4 animate-pulse">
          <TrendingDown className="text-red-500" size={24} />
          <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">
            Protocol Locked: Establish Neural Link in "Operations" to commit funds.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
            <TrendingDown size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Leakage <span className="text-red-500 italic">Audit</span></h1>
            <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-[0.2em] opacity-60">Capital Outflow Monitoring</p>
          </div>
        </div>
        <button 
          onClick={() => activeSession ? setShowModal(true) : alert("Please open a session first")}
          disabled={!activeSession}
          className={cn(
            "font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl text-xs uppercase tracking-widest group",
            activeSession 
              ? "bg-red-500 text-white hover:scale-[1.05] active:scale-95 shadow-red-500/20" 
              : "bg-white/5 text-[var(--text-muted)] border border-white/5 opacity-50 cursor-not-allowed"
          )}
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Commit Outflow
        </button>
      </div>

      <div className="cyber-card shadow-2xl overflow-hidden bg-red-500/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Temporal Key</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Operational Load</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Category Tag</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Capital Loss</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">System Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-red-500/10 transition-all group cursor-default">
                  <td className="p-8 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60">{format(new Date(e.date), 'dd MMM yyyy')}</td>
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-red-500 border border-white/5 shadow-inner">
                        <TrendingDown size={18} />
                      </div>
                      <span className="font-black text-[var(--text-main)] group-hover:text-red-500 transition-all text-sm uppercase italic tracking-tight">{e.title}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-white/5 text-[var(--text-muted)] opacity-60">{e.category}</span>
                  </td>
                  <td className="p-8 font-black text-red-500 text-lg tracking-tighter italic">-{formatCurrency(e.amount)}</td>
                  <td className="p-8 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider opacity-40 max-w-[150px] truncate italic">{e.notes || 'No registry entry'}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-32 text-center text-[var(--text-muted)]">
                     <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/5 mx-auto flex items-center justify-center mb-6 opacity-20">
                        <TrendingDown size={32} />
                     </div>
                     <p className="text-xs font-black uppercase tracking-[0.3em] italic mb-1">Fiscal Zero-Point</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No resource leakage detected in current period.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AuditLogWidget entity="EXPENSE" limit={5} className="bg-[var(--bg-card)]/40" />
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">New Expense</h2>
                <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Title</label>
                  <input 
                    required
                    type="text"
                    placeholder="Staff Salary, Electric..."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-red-500 transition-all text-[var(--text-main)] text-sm"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Amount</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-red-500 transition-all text-[var(--text-main)] text-sm"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Category</label>
                    <select 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-red-500 transition-all text-[var(--text-main)] text-sm appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Rent</option>
                      <option>Salaries</option>
                      <option>Electricity</option>
                      <option>Maintenance</option>
                      <option>Marketing</option>
                      <option>Others</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Notes</label>
                  <textarea 
                    rows={2}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-red-500 transition-all resize-none text-[var(--text-main)] text-sm"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 md:gap-4 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl font-bold hover:bg-white/5 transition-all text-[var(--text-muted)] text-xs md:text-sm uppercase tracking-widest">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/20 text-xs md:text-sm uppercase tracking-widest">
                    Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pt-12 border-t border-white/5">
        <AuditLogWidget entity="EXPENSE" limit={5} className="bg-primary/5" />
      </div>
    </div>
  );
};

export default Expenses;
