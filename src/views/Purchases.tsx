import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, cn } from '../lib/utils';
import { CreditCard, Plus, Search, Calendar, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import AuditLogWidget from '../components/AuditLogWidget';

const Purchases: React.FC = () => {
  const { purchases, addPurchase, products, daySummaries } = useStore();
  const activeSession = daySummaries.find(d => !d.isClosed);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    addPurchase({
      productId: formData.productId,
      productName: product.name,
      quantity: formData.quantity,
      price: formData.price
    });
    setShowModal(false);
    setFormData({ productId: '', quantity: 0, price: 0 });
  };

  return (
    <div className="space-y-12 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      {!activeSession && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-[2rem] flex items-center gap-4 animate-pulse">
          <Package className="text-yellow-500" size={24} />
          <p className="text-xs font-black text-yellow-500 uppercase tracking-[0.2em]">
            Temporal Lock: Operations session required for resource load commit.
          </p>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <CreditCard size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Resource <span className="text-primary italic">Load</span></h1>
            <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-[0.2em] opacity-60">Inventory Infusion Registry</p>
          </div>
        </div>
        <button 
          onClick={() => activeSession ? setShowModal(true) : alert("Please open a session first")}
          disabled={!activeSession}
          className={cn(
            "font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl text-xs uppercase tracking-widest group",
            activeSession ? "bg-primary text-[#020617] hover:scale-[1.05] shadow-cyan-500/20 active:scale-95" : "bg-white/5 border border-white/5 text-[var(--text-muted)] opacity-50 cursor-not-allowed"
          )}
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Commit Load
        </button>
      </div>

      <div className="cyber-card shadow-2xl overflow-hidden bg-primary/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Entry Key</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Matrix Node</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Quantity</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Unit Value</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Net Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-primary/10 transition-all group text-[var(--text-main)] cursor-default">
                  <td className="p-8 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60 italic">{format(new Date(p.date), 'dd MMM yyyy')}</td>
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-primary border border-white/5 shadow-inner">
                        <Package size={20} />
                      </div>
                      <span className="font-black group-hover:text-primary transition-all text-sm uppercase italic tracking-tight">{p.productName}</span>
                    </div>
                  </td>
                  <td className="p-8 font-black text-[var(--text-main)] tracking-widest italic">{p.quantity}</td>
                  <td className="p-8 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{formatCurrency(p.price)}</td>
                  <td className="p-8 font-black text-red-500 text-lg italic tracking-tighter">-{formatCurrency(p.quantity * p.price)}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-32 text-center text-[var(--text-muted)]">
                     <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/5 mx-auto flex items-center justify-center mb-6 opacity-20">
                        <CreditCard size={32} />
                     </div>
                     <p className="text-xs font-black uppercase tracking-[0.3em] italic mb-1">Stasis Point</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No external resource infusion detected.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AuditLogWidget entity="PURCHASE" limit={5} className="bg-[var(--bg-card)]/40" />
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl font-bold mb-8 text-[var(--text-main)] tracking-tight">Record New Purchase</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Select Product</label>
                  <select 
                    required
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)] appearance-none"
                    value={formData.productId}
                    onChange={(e) => {
                      const p = products.find(prod => prod.id === e.target.value);
                      setFormData({...formData, productId: e.target.value, price: p?.purchasePrice || 0});
                    }}
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="bg-[var(--bg-card)] text-[var(--text-main)]">{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Quantity</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)]"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Unit Price</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)]"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 text-center">Estimated Total Cost</p>
                    <p className="text-2xl font-black text-primary text-center tracking-tighter">{formatCurrency(formData.quantity * formData.price)}</p>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl font-bold hover:bg-primary/5 transition-all text-[var(--text-muted)]">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-[#020617] rounded-2xl font-black hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/20">
                    SAVE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pt-12 border-t border-white/5">
        <AuditLogWidget entity="PURCHASE" limit={5} className="bg-primary/5" />
      </div>
    </div>
  );
};

export default Purchases;
