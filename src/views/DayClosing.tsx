import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, cn } from '../lib/utils';
import { Lock, FileText, Download, CheckCircle2, AlertTriangle, Calendar, TrendingDown, History, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import AuditLogWidget from '../components/AuditLogWidget';

const DayClosing: React.FC = () => {
  const { sales, expenses, purchases, daySummaries, closeDay, startDay, products, company } = useStore();
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
  const activeSession = daySummaries.find(d => !d.isClosed);
  const lastSession = daySummaries[0];
  const currentSession = activeSession || lastSession;

  const isStarted = !!activeSession;
  const isClosed = !activeSession && lastSession?.isClosed;

  // Calculate stats for the CURRENT (active or last) session
  const sessionStartTime = currentSession ? new Date(currentSession.startTime) : new Date(0);
  const sessionEndTime = currentSession?.endTime ? new Date(currentSession.endTime) : new Date();

  const sessionSales = sales.filter(s => {
    const d = new Date(s.date);
    return d >= sessionStartTime && (!currentSession?.isClosed || d <= sessionEndTime);
  });
  const sessionExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d >= sessionStartTime && (!currentSession?.isClosed || d <= sessionEndTime);
  });
  const sessionPurchases = purchases.filter(p => {
    const d = new Date(p.date);
    return d >= sessionStartTime && (!currentSession?.isClosed || d <= sessionEndTime);
  });

  const totalSold = sessionSales.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalExp = sessionExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPurchase = sessionPurchases.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
  
  const cashReceived = sessionSales.reduce((acc, curr) => acc + (curr.cashAmount || 0), 0);
  const scanReceived = sessionSales.reduce((acc, curr) => acc + (curr.qrAmount || 0), 0);
  const cardReceived = sessionSales.reduce((acc, curr) => acc + (curr.cardAmount || 0), 0);

  const openingStockVal = currentSession?.openingStockValue ?? products.reduce((acc, curr) => acc + curr.openingStock * curr.purchasePrice, 0);
  const closingStockVal = products.reduce((acc, curr) => acc + curr.closingStock * curr.purchasePrice, 0);

  const cogs = (openingStockVal + totalPurchase) - closingStockVal;
  const profitValue = totalSold - cogs - totalExp;

  const handleStartDay = () => {
    startDay();
    setShowStartConfirm(false);
  };

  const handleCloseDay = () => {
    closeDay();
    setShowCloseConfirm(false);
  };

  const generateReport = (summaryData?: any, dateStr?: string) => {
    const data = summaryData || {
      openingStockValue: openingStockVal,
      purchaseAmount: totalPurchase,
      closingStockValue: closingStockVal,
      salesAmount: totalSold,
      scanPayAmount: scanReceived,
      cardPayAmount: cardReceived,
      expensesAmount: totalExp,
      cashAmount: cashReceived,
      profit: profitValue,
    };
    
    const expenseDetails = !dateStr ? sessionExpenses : [];
    const displayDate = dateStr || format(new Date(), 'yyyy-MM-dd');
    const doc = new jsPDF();
    
    const formatValue = (val: number) => {
      const safeVal = isNaN(val) || val === undefined || val === null ? 0 : val;
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(safeVal);
    };

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(company.name.toUpperCase(), 15, 20);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`SETTLEMENT DATE: ${format(new Date(displayDate), 'dd/MM/yyyy')}`, 195, 20, { align: 'right' });
    
    doc.setDrawColor(200);
    doc.line(15, 25, 195, 25);

    // Main Box
    doc.setDrawColor(50);
    doc.setLineWidth(0.2);
    doc.rect(15, 35, 120, 85); 
    
    let y = 45;
    const drawLine = (label: string, value: number, isBold = false) => {
      doc.setFontSize(10);
      if (isBold) doc.setFont('helvetica', 'bold');
      doc.setTextColor(60);
      doc.text(label, 20, y);
      doc.text(formatValue(value), 130, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 10;
    };

    drawLine("Opening Stock Amount", data.openingStockValue);
    drawLine("Purchase Amount", data.purchaseAmount);
    drawLine("Closing Stock Amount", data.closingStockValue);
    drawLine("Sales Amount", data.salesAmount);
    drawLine("SCAN PAY", data.scanPayAmount);
    drawLine("CARD PAY", data.cardPayAmount);
    drawLine("EXPENSES", data.expensesAmount);
    drawLine("CASH COLLECTED", data.cashAmount, true);

    // Expenses Section
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text("EXPENSE BREAKDOWN", 15, y);
    y += 5;
    
    doc.rect(15, y, 120, 35);
    doc.line(15, y + 8, 135, y + 8);
    doc.line(85, y, 85, y + 35);
    
    doc.setFontSize(9);
    doc.text("Details", 50, y + 5, { align: 'center' });
    doc.text("Amount", 110, y + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    let ey = y + 14;
    const sortedExpenses = [...expenseDetails].sort((a, b) => b.amount - a.amount);
    
    if (sortedExpenses.length === 0) {
      doc.setTextColor(150);
      doc.text("No records found", 50, ey, { align: 'center' });
    } else {
      sortedExpenses.slice(0, 4).forEach(exp => {
          doc.text(exp.title.substring(0, 35), 18, ey);
          doc.text(formatValue(exp.amount), 132, ey, { align: 'right' });
          ey += 6;
      });
    }

    // Profit Footer
    y += 45;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, y, 120, 15, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text("NET PROFIT:", 20, y + 10);
    doc.text(formatValue(data.profit), 130, y + 10, { align: 'right' });

    doc.save(`Invoice_${displayDate}.pdf`);
  };


  const SummaryItem = ({ label, value, icon: Icon, color }: any) => (
    <div className="cyber-card p-4 sm:p-6 flex flex-col gap-4 shadow-2xl bg-primary/5 group hover:bg-primary/10 transition-all border-white/5 hover:border-primary/30 min-w-0 h-full">
      <div className={cn("p-3 rounded-2xl shadow-inner shrink-0 w-fit", color)}>
        <Icon size={24} />
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-[var(--text-muted)] text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none">{label}</p>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-main)] tracking-tight leading-tight italic break-all whitespace-normal">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-2">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Calendar size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Ledger <span className="text-primary italic">Ops</span></h1>
            <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-[0.2em] opacity-60">Daily Reconciliation & Session Logic</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {!isStarted ? (
            <button 
              onClick={() => setShowStartConfirm(true)}
              className="w-full sm:w-auto bg-primary text-[#020617] font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-cyan-500/20 text-xs uppercase tracking-widest group"
            >
              <Calendar size={20} className="group-hover:scale-110 transition-transform" /> Open Neural Session
            </button>
          ) : isClosed ? (
            <button 
              onClick={() => generateReport(lastSession, lastSession.date)}
              className="w-full sm:w-auto bg-green-500 text-white font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-widest text-xs shadow-2xl shadow-green-500/20"
            >
              <Download size={20} /> Export Evidence
            </button>
          ) : (
            <button 
              onClick={() => setShowCloseConfirm(true)}
              className="w-full sm:w-auto bg-red-500 text-white font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-red-500/20 text-xs uppercase tracking-widest"
            >
              <Lock size={20} /> Terminate Logic
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showStartConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Open Session</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Initialization Confirmation</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest">Opening Stock Value</span>
                  <span className="text-lg font-black text-[var(--text-main)]">{formatCurrency(openingStockVal)}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic">
                  Starting a session will allow sales, purchases and expenses recording. Your current closing stock will become today's opening balance.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowStartConfirm(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-[var(--text-muted)] hover:bg-primary/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartDay}
                  className="flex-1 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-[#020617] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Confirm & Open
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showCloseConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F87171]/10 flex items-center justify-center text-[#F87171]">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Close Session</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Final Audit Review</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Total Sales</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(totalSold)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Expenses</p>
                  <p className="text-sm font-bold text-[#F87171]">{formatCurrency(totalExp)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Net Cash</p>
                  <p className="text-sm font-bold text-[var(--text-main)]">{formatCurrency(cashReceived)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Session Profit</p>
                  <p className="text-sm font-bold text-[#10B981]">{formatCurrency(profitValue)}</p>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic">
                Closing the session will generate the final report and disable further transactions until the next session is opened.
              </p>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-[var(--text-muted)] hover:bg-primary/5 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCloseDay}
                  className="flex-1 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-[#F87171] text-white hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#F87171]/20"
                >
                  Finalize & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isClosed && (
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-[#020617] shrink-0 shadow-lg shadow-[#10B981]/20">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#10B981]">Daily Reconciliation Finalized</h3>
                <p className="text-sm text-[#10B981]/80">The system has generated the final audit for the session. All records are locked for this period.</p>
              </div>
            </div>
          )}

          {/* Info Card */}
          {!isClosed && (
            <div className="bg-[#22D3EE]/5 border border-[#22D3EE]/20 p-4 rounded-2xl flex gap-3 mb-6">
              <AlertTriangle className="text-[#22D3EE] shrink-0" size={20} />
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                <strong className="text-[#22D3EE] block mb-1 uppercase tracking-widest">About Day Closing</strong>
                This process reconciles your POS income with your ledger balance. It audits your Opening Stock, new Purchases, and operating Expenses to calculate your precise Net Profit for the last 24 hours. Once closed, records are locked for security.
              </p>
            </div>
          )}

          {/* Financial Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
            <SummaryItem label="Opening Stock" value={formatCurrency(currentSession?.openingStockValue || openingStockVal)} icon={History} color="bg-slate-500/10 text-slate-500" />
            <SummaryItem label="Purchases Day" value={formatCurrency(currentSession?.purchaseAmount || totalPurchase)} icon={TrendingDown} color="bg-red-500/10 text-red-500" />
            <SummaryItem label="Closing Stock" value={formatCurrency(currentSession?.closingStockValue || closingStockVal)} icon={CheckCircle2} color="bg-green-500/10 text-green-500" />
            <SummaryItem label="Total Sales" value={formatCurrency(currentSession?.salesAmount || totalSold)} icon={FileText} color="bg-cyan-500/10 text-cyan-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Today's Expenses List */}
            <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)] border-b border-[var(--border-color)] pb-3">Session Expenses</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {sessionExpenses.length === 0 ? (
                  <p className="text-[10px] text-[var(--text-muted)] italic opacity-50 py-4 text-center">No expenses recorded today</p>
                ) : (
                  sessionExpenses.map((exp, i) => (
                    <div key={exp.id || `exp-${i}`} className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                      <div>
                        <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-tighter">{exp.title}</p>
                        <p className="text-[9px] text-[var(--text-muted)] uppercase">{exp.category}</p>
                      </div>
                      <span className="text-sm font-black text-[#F87171]">-{formatCurrency(exp.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Sales List */}
            <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)] border-b border-[var(--border-color)] pb-3">Latest Invoices</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {sessionSales.length === 0 ? (
                  <p className="text-[10px] text-[var(--text-muted)] italic opacity-50 py-4 text-center">No sales recorded today</p>
                ) : (
                  sessionSales.slice(-5).reverse().map((sale, i) => (
                    <div key={sale.id || `sale-${i}`} className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                      <div>
                        <p className="text-xs font-bold text-[var(--text-main)] tracking-tighter">INV-{(sales.length - i).toString().padStart(3, '0')}</p>
                        <p className="text-[9px] text-[var(--text-muted)] uppercase">{sale.paymentMethod} • {format(new Date(sale.date), 'HH:mm')}</p>
                      </div>
                      <span className="text-sm font-black text-[#10B981]">{formatCurrency(sale.totalAmount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="cyber-card p-10 relative overflow-hidden shadow-2xl bg-primary/5">
            <div className="absolute top-0 right-0 p-8 rotate-12 opacity-[0.02]">
              <FileText size={200} className="text-[var(--text-main)]" />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-start text-left">
               <div className="space-y-8 min-w-0">
                  <h3 className="text-2xl font-black border-b border-white/5 pb-4 text-[var(--text-main)] uppercase tracking-tighter italic">Collections Breakdown</h3>
                  <div className="space-y-6">
                    <div className="flex flex-col border-b border-white/5 pb-4 min-w-0">
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60 mb-2">Cash Base</div>
                       <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] italic tracking-tighter break-all whitespace-normal">{formatCurrency(currentSession?.cashAmount || cashReceived)}</div>
                    </div>
                    <div className="flex flex-col border-b border-white/5 pb-4 min-w-0">
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60 mb-2">Neural Scan (QR)</div>
                       <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] italic tracking-tighter break-all whitespace-normal">{formatCurrency(currentSession?.scanPayAmount || scanReceived)}</div>
                    </div>
                    <div className="flex flex-col border-b border-white/5 pb-4 min-w-0">
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60 mb-2">Card Interface</div>
                       <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] italic tracking-tighter break-all whitespace-normal">{formatCurrency(currentSession?.cardPayAmount || cardReceived)}</div>
                    </div>
                    <div className="flex flex-col border-b border-white/5 pb-4 min-w-0">
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 opacity-60 mb-2">Leakage (Expenses)</div>
                       <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-red-500 italic tracking-tighter break-all whitespace-normal">-{formatCurrency(currentSession?.expensesAmount || totalExp)}</div>
                    </div>
                  </div>
               </div>
 
                  <div className="bg-[var(--bg-main)] p-8 sm:p-12 rounded-[40px] border border-white/5 flex flex-col justify-center items-center text-center shadow-inner relative overflow-hidden group">
                     <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-6 opacity-60">Neural Net Profit (24H)</p>
                     <h2 className={cn(
                       "text-3xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tighter italic shadow-sm break-all",
                       (currentSession?.profit ?? profitValue) >= 0 ? "text-primary drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-red-500"
                     )}>
                       {formatCurrency(currentSession?.profit ?? profitValue)}
                     </h2>
                     <div className="mt-6 pt-6 border-t border-white/5 w-full text-[10px] text-[var(--text-muted)] italic font-bold opacity-40 space-y-2 uppercase tracking-widest">
                       <p>Formula: Sales Totals - COGS - Leakage</p>
                       <p>COGS: (Opening + Load) - Closing</p>
                     </div>
                  </div>
            </div>
          </div>

          {!isClosed && (
            <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/30 p-6 rounded-3xl flex items-center gap-4">
              <AlertTriangle className="text-[#FBBF24] shrink-0" size={24} />
              <p className="text-sm text-[#FBBF24]/80 italic font-medium">Attention: Closing the day will lock all inventory modifications for the current timestamp.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
           <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-main)] opacity-90 flex items-center gap-2">
                <History size={20} className="text-[#22D3EE]" />
                <h3 className="font-bold text-[var(--text-main)] tracking-tight text-sm uppercase tracking-widest">Past Settlements</h3>
             </div>
             <div className="p-3 md:p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {daySummaries.filter(d => d.isClosed).length === 0 ? (
                  <div className="py-8 text-center text-[var(--text-muted)] opacity-50 text-[10px] italic">No past sessions recorded</div>
                ) : (
                  daySummaries.filter(d => d.isClosed).map((summary, i) => (
                    <div key={summary.id || `summary-${i}`} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] group hover:border-[#22D3EE]/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[var(--text-main)]">{format(new Date(summary.date), 'MMM dd, yyyy')}</span>
                        <button 
                          onClick={() => generateReport(summary, summary.date)}
                          className="text-[#22D3EE] hover:text-[var(--text-main)] transition-colors"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase">Net Profit</span>
                        <span className={cn(
                          "text-xs font-bold",
                          summary.profit >= 0 ? "text-[#22D3EE]" : "text-[#F87171]"
                        )}>
                          {formatCurrency(summary.profit)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
      
      <div className="pt-12 border-t border-white/5">
        <AuditLogWidget entity="SESSION" limit={5} className="bg-primary/5" />
      </div>
    </div>
  );
};

export default DayClosing;
