import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Minus, Trash2, Printer, 
  CreditCard, Banknote, QrCode, X, CheckCircle2, ShoppingCart, ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, POSItem, PaymentMethod } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import AuditLogWidget from '../components/AuditLogWidget';

const POS: React.FC = () => {
  const { products, addSale, company, daySummaries } = useStore();
  const activeSession = daySummaries.find(d => !d.isClosed);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<POSItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
  );

  const addToCart = (product: Product) => {
    if (product.closingStock <= 0) {
      alert("Out of stock!");
      return;
    }
    
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.closingStock) {
        alert("Cannot add more than available stock!");
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([
        ...cart, 
        { id: Math.random().toString(), productId: product.id, name: product.name, price: product.price, quantity: 1, total: product.price }
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === item.productId);
        const newQty = Math.max(0, item.quantity + delta);
        if (product && newQty > product.closingStock) return item;
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.total, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    addSale({
      items: cart,
      totalAmount,
      paymentMethod,
      cashAmount: paymentMethod === PaymentMethod.CASH ? totalAmount : 0,
      qrAmount: paymentMethod === PaymentMethod.QR ? totalAmount : 0,
      cardAmount: paymentMethod === PaymentMethod.CARD ? totalAmount : 0,
      customerName
    });
    
    setShowReceipt(true);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      format: [80, 150], // Receipt size
      unit: 'mm'
    });

    doc.setFontSize(12);
    doc.text(company.name, 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text(company.address, 40, 15, { align: 'center' });
    doc.text(`Ph: ${company.phone}`, 40, 20, { align: 'center' });
    doc.text('-------------------------------------------', 40, 25, { align: 'center' });
    
    let y = 30;
    cart.forEach(item => {
      doc.text(`${item.name} x ${item.quantity}`, 5, y);
      doc.text(item.total.toString(), 75, y, { align: 'right' });
      y += 5;
    });

    doc.text('-------------------------------------------', 40, y + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.text('TOTAL', 5, y + 12);
    doc.text(formatCurrency(totalAmount), 75, y + 12, { align: 'right' });
    
    doc.setFontSize(8);
    doc.text('Thank you! Visit again.', 40, y + 25, { align: 'center' });
    doc.text(format(new Date(), 'dd MMM yyyy HH:mm'), 40, y + 30, { align: 'center' });

    doc.save(`receipt_${Date.now()}.pdf`);
  };

  const resetPOS = () => {
    setCart([]);
    setCustomerName('');
    setShowReceipt(false);
  };

  return (
    <div className="flex flex-col gap-8 bg-[var(--bg-main)] relative pb-20">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {!activeSession && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl flex items-center gap-4 animate-pulse cyber-glow">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
             <X size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Security Alert: Access Terminated</p>
            <p className="text-sm font-bold text-red-500/80 uppercase tracking-tighter">
              Session Locked: Please authorize terminal activation in "Operations" center.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 min-h-0">
        {/* Product Selection */}
        <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <ShoppingCart size={28} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Retail <span className="text-primary italic">Terminal</span></h1>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Active Session Zone • Unit 01</p>
              </div>
            </div>
            <div className="relative flex-1 md:max-w-xs group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Scan or search SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/30 uppercase font-bold tracking-widest"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 custom-scrollbar pb-32 lg:pb-0">
            {filteredProducts.map(product => (
              <motion.button
                whileTap={{ scale: 0.98 }}
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.closingStock <= 0}
                className={cn(
                  "cyber-card p-5 text-left group flex flex-col justify-between h-48 relative overflow-hidden",
                  product.closingStock <= 0 && "opacity-40 grayscale cursor-not-allowed border-white/5"
                )}
              >
                <div className="absolute -right-2 -top-2 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 transition-all" />
                <div className="min-w-0 relative z-10">
                  <p className="text-[9px] text-primary font-black mb-2 uppercase tracking-[0.2em] opacity-60">{product.sku}</p>
                  <h3 className="font-black text-sm leading-tight text-[var(--text-main)] group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tighter italic">{product.name}</h3>
                </div>
                <div className="flex items-end justify-between mt-4 relative z-10">
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-primary tracking-tighter shrink-0">{formatCurrency(product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <div className={cn("w-1.5 h-1.5 rounded-full", product.closingStock < 5 ? "bg-red-500 animate-pulse" : "bg-success")} />
                       <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Unit: {product.closingStock}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[#020617] group-hover:cyber-glow transition-all duration-300">
                    <Plus size={20} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cart / Billing */}
        <div className="lg:col-span-4 cyber-card p-1 shadow-2xl overflow-hidden flex flex-col h-full bg-primary/5">
          <div className="bg-[var(--bg-card)] rounded-[22px] flex flex-col h-full overflow-hidden">
            <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--text-main)] uppercase italic tracking-tighter leading-none">Order Queue</h2>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1.5">{cart.length} Unit(s) Loaded</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-30 gap-6 py-12">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[var(--border-color)] flex items-center justify-center">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-[0.4em] italic text-center">Awaiting System <br /> Inputs...</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between group p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] sm:text-xs text-[var(--text-main)] truncate uppercase tracking-tight italic">{item.name}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-primary tracking-widest mt-0.5 opacity-70">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-3 bg-[var(--bg-main)] p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-[10px] sm:text-xs font-black w-4 sm:w-6 text-center text-[var(--text-main)]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-[var(--text-muted)] hover:text-primary transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="p-8 bg-white/5 border-t border-[var(--border-color)] space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>System Subtotal</span>
                  <span className="text-[var(--text-main)]">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest block truncate">Grand Total</span>
                    <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Tax & Duty Included</p>
                  </div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--text-main)] tracking-tighter italic glow-text break-all text-right">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: PaymentMethod.CASH, label: 'Fiat Cash', icon: Banknote },
                  { id: PaymentMethod.QR, label: 'Digital QR', icon: QrCode },
                  { id: PaymentMethod.CARD, label: 'Credit Auth', icon: CreditCard },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 group",
                      paymentMethod === method.id 
                        ? "bg-primary/10 border-primary text-primary cyber-glow" 
                        : "border-white/10 text-[var(--text-muted)] hover:bg-white/5"
                    )}
                  >
                    <method.icon size={18} className={cn("transition-colors", paymentMethod === method.id ? "text-primary" : "group-hover:text-white")} />
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-80">{method.label}</span>
                  </button>
                ))}
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-5 bg-primary text-[#020617] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3 text-lg uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20"
              >
                Confirm Dispatch <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

    {/* Receipt Modal */}
    <AnimatePresence>
      {showReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetPOS}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-8 text-center border-b border-[var(--border-color)] bg-green-500/10">
                <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                <h2 className="text-xl md:text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter">Success!</h2>
                <p className="text-[var(--text-muted)] mt-1 md:mt-2 text-xs font-medium">Sale recorded successfully.</p>
              </div>

              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-[11px] md:text-sm font-medium">
                      <span className="text-[var(--text-muted)] uppercase tracking-tighter">{item.name} x {item.quantity}</span>
                      <span className="text-[var(--text-main)] font-black">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[var(--border-color)] border-dashed border-t" />
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold text-xs md:text-sm text-[var(--text-muted)] uppercase tracking-widest">Total Paid ({paymentMethod})</span>
                  <span className="text-lg md:text-xl font-black text-primary tracking-tighter">{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={generatePDF}
                    className="flex-1 py-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-bold text-xs md:text-sm text-[var(--text-main)] uppercase tracking-widest"
                  >
                    <Printer size={16} /> Download Invoice
                  </button>
                  <button 
                    onClick={resetPOS}
                    className="flex-1 py-3 bg-primary text-[#020617] rounded-xl font-black hover:scale-[1.02] transition-all text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/20"
                  >
                    Next Sale
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POS;
