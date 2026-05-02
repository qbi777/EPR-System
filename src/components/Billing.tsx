import React from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  CreditCard, 
  Wallet, 
  QrCode,
  ArrowRight,
  Package,
  X,
  Printer
} from 'lucide-react';
import { useStore, Product, Batch } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export default function Billing() {
  const { products, batches, processSale, recordManualSale, currentUser, auditLogs, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [cart, setCart] = React.useState<{ productId: string, quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState<'Cash' | 'QR' | 'Card'>('Cash');
  const [isManualEntry, setIsManualEntry] = React.useState(false);
  const [manualAmount, setManualAmount] = React.useState('');
  const [manualDetails, setManualDetails] = React.useState('');

  const filteredProducts = products.filter(p => 
    p.status === 'Active' && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStock = (productId: string) => {
    return batches
      .filter(b => b.productId === productId)
      .reduce((acc, b) => acc + b.currentQuantity, 0);
  };

  const addToCart = (productId: string) => {
    const available = getStock(productId);
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity < available) {
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
      }
    } else {
      if (available > 0) {
        setCart([...cart, { productId, quantity: 1 }]);
      }
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const available = getStock(productId);
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, Math.min(available, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return acc + (item.quantity * (p?.sellingPrice || 0));
    }, 0);
  };

  const handleCheckout = () => {
    if (!currentUser) return;
    
    if (isManualEntry) {
      const amount = parseFloat(manualAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      recordManualSale(amount, paymentMethod, manualDetails);
      setManualAmount('');
      setManualDetails('');
      setIsManualEntry(false);
      return;
    }

    if (cart.length === 0) return;
    try {
      processSale({
        paymentMethod,
        processedBy: currentUser.id,
      }, cart);
      setCart([]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:min-h-[700px]">
        {/* Left: Product Selection or Manual Entry */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Terminal 01</h2>
              <button 
                onClick={() => setIsManualEntry(!isManualEntry)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  isManualEntry 
                    ? "bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
                    : "bg-slate-500/10 text-slate-500 border-slate-500/20 hover:border-slate-500/40"
                )}
              >
                {isManualEntry ? 'Exit Manual Entry' : 'Quick Manual Sale'}
              </button>
            </div>
            {!isManualEntry && (
              <div className="w-full sm:w-[400px] glass flex items-center gap-3 px-6 py-3 rounded-2xl">
                <Search className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-white w-full font-medium text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide min-h-[400px]">
            {isManualEntry ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-12 rounded-[3.5rem] max-w-xl mx-auto space-y-8"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Quick Sales Entry</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose">Use this for untracked or aggregate sales reporting</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Amount (₹)</label>
                    <input 
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-2xl px-6 py-5 text-4xl font-black outline-none focus:border-primary transition-colors border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transaction Details</label>
                    <textarea 
                      value={manualDetails}
                      onChange={(e) => setManualDetails(e.target.value)}
                      placeholder="Internal note for this transaction..."
                      className="w-full rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-primary transition-colors min-h-[100px] border"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map(product => {
                  const stock = getStock(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product.id)}
                      disabled={stock === 0}
                      className="glass p-4 rounded-3xl text-left transition-all group disabled:opacity-30 disabled:grayscale"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/20">
                          {product.category}
                        </span>
                        <span className={cn("text-[9px] font-black", stock < 10 ? "text-rose-500" : "text-emerald-400")}>
                          {stock < 10 ? 'LOW' : 'IN STOCK'}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-tight mb-2 truncate leading-none">{product.name}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-black text-white">₹{product.sellingPrice}</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500">{stock} PCS</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart or Manual Checkout */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col h-full sticky top-24 lg:static">
          <div className="glass flex-1 rounded-[3rem] flex flex-col overflow-hidden bg-slate-500/5">
            <div className="p-6 border-b border-slate-800/10 flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 text-primary">
                <ShoppingCart className="w-5 h-5" />
                {isManualEntry ? 'Manual Pay' : 'Cart'}
              </h3>
              {!isManualEntry && <span className="text-[10px] font-black px-2 py-1 bg-slate-500/10 rounded-lg text-slate-500 border border-slate-500/20">{cart.length} ITEMS</span>}
            </div>

            {isManualEntry ? (
              <div className="flex-1 p-8 flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-white uppercase tracking-tight">Manual Reconciliation</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[200px]">Stock will not be deducted for manual entries. Use responsibly for loose sales.</p>
              </div>
            ) : (
              <div className="h-[300px] lg:flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="bg-slate-500/5 border border-slate-500/10 p-3 rounded-2xl flex items-center justify-between group gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-white uppercase truncate">{product?.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">₹{product?.sellingPrice}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-500/10 rounded-lg px-2 py-1 border border-slate-500/20">
                          <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1); }} className="p-1 text-slate-500 hover:text-white transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-white">{item.quantity}</span>
                          <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1); }} className="p-1 text-slate-500 hover:text-white transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.productId); }} className="text-slate-500 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none py-10">
                    <Package className="w-10 h-10 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting items</p>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 bg-slate-500/5 border-t border-slate-500/10 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'QR', 'Card'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as any)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[9px] font-black uppercase",
                      paymentMethod === method 
                        ? "bg-primary text-slate-950 border-primary" 
                        : "bg-slate-500/10 border-slate-500/20 text-slate-500 hover:border-slate-500/40"
                    )}
                  >
                    <span className="truncate">{method}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Revenue</span>
                <span className="text-2xl font-black text-white">₹{(isManualEntry ? parseFloat(manualAmount) || 0 : calculateTotal()).toLocaleString()}</span>
              </div>
              
              <button 
                disabled={isManualEntry ? !manualAmount : cart.length === 0}
                onClick={handleCheckout}
                className="w-full bg-primary text-slate-950 font-black py-4 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                {isManualEntry ? 'AUTHENTICATE SALE' : 'COMMIT TRANSACTION'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <SectionAudit module={["Sales", "Auth"]} />
    </div>
  );
}
