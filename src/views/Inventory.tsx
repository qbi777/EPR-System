import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, cn, generateId } from '../lib/utils';
import { Package, Plus, Search, Filter, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuditLogWidget from '../components/AuditLogWidget';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    purchasePrice: 0,
    openingStock: 0,
    category: 'Electronics'
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      sku: p.sku,
      price: p.price,
      purchasePrice: p.purchasePrice,
      openingStock: p.openingStock,
      category: p.category
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct({ ...formData, purchased: 0, sold: 0 });
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', sku: '', price: 0, purchasePrice: 0, openingStock: 0, category: 'Electronics' });
  };

  return (
    <div className="space-y-12 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Stock <span className="text-primary italic">Center</span></h1>
            <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-[0.2em] opacity-60">Global Inventory Logistics</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-[#020617] font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-cyan-500/20 text-xs uppercase tracking-widest group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Register Asset
        </button>
      </div>

      <div className="cyber-card shadow-2xl overflow-hidden bg-primary/5">
        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-main)]/30 backdrop-blur-xl">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Filter assets by SKU or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-primary/50 transition-all text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/10 font-bold tracking-widest uppercase"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]/50">
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Logistic Asset</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Commercial Pricing</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Inventory Load</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-right">System Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-primary/5 transition-all group cursor-default">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-primary border border-white/5 shadow-inner group-hover:border-primary/30 transition-colors">
                        <Package size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-[var(--text-main)] group-hover:text-primary transition-colors truncate uppercase italic tracking-tight">{p.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60">{p.sku} • {p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-[var(--text-main)]">
                    <p className="font-black text-lg tracking-tighter italic">{formatCurrency(p.price)}</p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-50 mt-1">Cost: {formatCurrency(p.purchasePrice)}</p>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            p.closingStock < 10 ? "text-red-500 animate-pulse" : "text-primary"
                          )}>
                            {p.closingStock < 10 ? 'Stock Emergency' : 'Level Stable'}
                          </span>
                          <span className="text-[10px] font-black text-[var(--text-main)]">{p.closingStock} Units</span>
                       </div>
                       <div className="h-2 w-48 bg-[var(--bg-main)] border border-white/5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-700 shadow-[0_0_10px_currentColor]",
                              p.closingStock < 10 ? "bg-red-500" : "bg-primary"
                            )} 
                            style={{ width: `${Math.min(100, (p.closingStock/50)*100)}%` }} 
                          />
                       </div>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleEdit(p)} 
                        className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl text-primary hover:bg-primary/20 hover:border-primary/30 transition-all active:scale-95"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-32 text-center text-[var(--text-muted)]">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[var(--border-color)] mx-auto flex items-center justify-center mb-8 opacity-20">
              <Package size={48} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.4em] italic mb-2">Operational Deadzone</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No logistic assets detected in system memory.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AuditLogWidget entity="PRODUCT" limit={5} className="bg-[var(--bg-card)]/40" />
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => { setShowModal(false); setEditingId(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-main)] tracking-tight">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => { setShowModal(false); setEditingId(null); }} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Product Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)] text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">SKU / Code</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all font-mono text-[var(--text-main)] text-sm"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Category</label>
                    <select 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)] text-sm appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Electronics</option>
                      <option>Hardware</option>
                      <option>Accessories</option>
                      <option>Clothing</option>
                      <option>Food</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Selling Price</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)] text-sm"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Purchase Price</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)] text-sm"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Initial Stock</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-[var(--text-main)] text-sm"
                      value={formData.openingStock}
                      onChange={(e) => setFormData({...formData, openingStock: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 md:gap-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); setEditingId(null); }}
                    className="flex-1 py-3 bg-white/5 border border-[var(--border-color)] rounded-xl font-bold hover:bg-white/10 transition-all text-[var(--text-muted)] text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-[#020617] rounded-xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/10 text-xs md:text-sm uppercase"
                  >
                    {editingId ? 'Save' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
