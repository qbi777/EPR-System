import React from 'react';
import { 
  Plus, 
  Search, 
  Receipt, 
  DollarSign, 
  Tag, 
  CreditCard, 
  Wallet,
  X,
  History,
  TrendingDown,
  ChevronRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { useStore, Expense } from '../store';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, dailyStocks, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);

  const activeDay = dailyStocks.find(d => d.status === 'OPEN');

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Outflow Tracker</h2>
          <p className="text-slate-400 font-medium">Monitor store expenses and operational costs</p>
        </div>
        <button 
          onClick={() => { setEditingExpense(null); setShowModal(true); }}
          className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase"
        >
          <Plus className="w-5 h-5" />
          ADD EXPENSE
        </button>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2.5rem] bg-rose-500/5">
          <TrendingDown className="w-8 h-8 text-rose-500 mb-4" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Day Outflow</p>
          <h3 className="text-3xl font-black text-white">₹{activeDay?.totalExpenses.toLocaleString() || '0'}</h3>
        </div>
        <div className="glass p-8 rounded-[2.5rem] lg:col-span-2 flex items-center gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Search Expenses</p>
            <div className="flex items-center gap-3 bg-slate-500/5 px-6 py-4 rounded-2xl border border-slate-500/10">
              <Search className="w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Ex: Electricity bill, Maintenance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-500/10 bg-slate-500/5">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-500/5 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-white uppercase tracking-tight">{format(new Date(expense.timestamp), 'PP')}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{format(new Date(expense.timestamp), 'HH:mm')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className="text-sm font-black text-slate-300 uppercase truncate max-w-[200px]">{expense.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-500/10 px-2.5 py-1.5 rounded-lg border border-slate-500/20">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {expense.paymentMethod === 'Cash' ? <Wallet className="w-3 h-3 text-emerald-400" /> : <CreditCard className="w-3 h-3 text-primary" />}
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{expense.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-white">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                         onClick={() => { setEditingExpense(expense); setShowModal(true); }}
                         className="p-2 text-slate-500 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => {
                           if (confirm('Delete this expense record?')) {
                             deleteExpense(expense.id);
                           }
                         }}
                         className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="py-20 text-center select-none">
              <History className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No expense records found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ExpenseModal expense={editingExpense} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <SectionAudit module="Expenses" />
    </div>
  );
}

function ExpenseModal({ expense, onClose }: { expense: Expense | null, onClose: () => void }) {
  const { addExpense, updateExpense, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [formData, setFormData] = React.useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    category: expense?.category || 'Operational',
    paymentMethod: expense?.paymentMethod || 'Cash' as 'Cash' | 'QR' | 'Card'
  });

  const categories = ['Operational', 'Maintenance', 'Rent', 'Electricity', 'Water', 'Marketing', 'Others'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (expense) {
        updateExpense(expense.id, formData);
      } else {
        addExpense(formData);
      }
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass w-full max-w-2xl p-10 rounded-[3rem]"
      >
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl font-black text-white uppercase tracking-tight">Record Expense</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expense Description</label>
            <input 
              required
              type="text" 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Office stationery, Tea party..."
              className="w-full rounded-2xl px-6 py-4 outline-none focus:border-rose-500 transition-colors font-medium border"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  required
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-rose-500 transition-colors font-medium border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-rose-500 transition-colors font-medium appearance-none border"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Source of Fund</p>
            <div className="grid grid-cols-3 gap-3">
              {['Cash', 'QR', 'Card'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: method as any })}
                  className={cn(
                    "p-4 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all",
                    formData.paymentMethod === method ? "bg-rose-500/10 border-rose-500 text-rose-500" : "bg-slate-500/5 border-slate-500/10 text-slate-500"
                  )}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-500/10 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-500/20 transition-colors uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-rose-500 text-white font-black py-5 rounded-2xl hover:bg-rose-400 transition-colors shadow-lg shadow-rose-500/20 uppercase tracking-widest text-xs"
            >
              Record Expense
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
