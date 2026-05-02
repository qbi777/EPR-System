import React from 'react';
import { 
  CalendarDays, 
  Lock, 
  Unlock, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowRight,
  FileText,
  AlertCircle,
  History,
  Download
} from 'lucide-react';
import { useStore, DailyStock } from '../store';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export function DailyStocks() {
  const { dailyStocks, openDay, closeDay, currentUser, expenses, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [showConfirm, setShowConfirm] = React.useState<'open' | 'close' | null>(null);

  const activeDay = dailyStocks.find(d => d.status === 'OPEN');
  const pastDays = dailyStocks.filter(d => d.status === 'CLOSED');

  const downloadJournal = (day: DailyStock) => {
    const doc = new jsPDF();
    const dayExpenses = expenses.filter(e => e.dailyStockId === day.id);

    // Title & Date
    doc.setFontSize(22);
    doc.text('OPERATIONAL JOURNAL', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(day.date), 'dd/MM/yyyy')}`, 190, 20, { align: 'right' });

    // Main Stats Container (Drawing lines for "bill" look)
    doc.setDrawColor(200);
    doc.rect(15, 30, 180, 80); // Border box

    const startX = 20;
    let startY = 40;
    const col2X = 185;

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, startX, startY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, col2X, startY, { align: 'right' });
      startY += 10;
    };

    addRow('Opening Stock Amount', `₹${day.openingValuation.toLocaleString()}`);
    addRow('Purchase Amount', `₹${day.totalPurchases.toLocaleString()}`);
    addRow('Closing Stock Amount', `₹${(day.closingValuation || 0).toLocaleString()}`);
    addRow('Sales Amount', `₹${day.totalSales.toLocaleString()}`);
    addRow('SCAN PAY', `₹${day.paymentBreakdown.qr.toLocaleString()}`);
    addRow('Card PAY', `₹${day.paymentBreakdown.card.toLocaleString()}`);
    addRow('Expenses', `₹${day.totalExpenses.toLocaleString()}`);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    addRow('Cash (Net)', `₹${day.paymentBreakdown.cash.toLocaleString()}`);

    // Expenses Details
    doc.setFontSize(14);
    doc.text('Expenses Details', 15, 125);
    
    autoTable(doc, {
      startY: 130,
      head: [['Details', 'Amount']],
      body: dayExpenses.map(e => [e.description, `₹${e.amount.toLocaleString()}`]),
      theme: 'grid',
      headStyles: { fillColor: [34, 211, 238], textColor: [15, 23, 42] },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    doc.save(`JOURNAL_${day.date}.pdf`);
  };

  const handleAction = () => {
    if (!currentUser) return;
    if (showConfirm === 'open') {
      openDay(currentUser.id);
    } else {
      closeDay(currentUser.id);
    }
    setShowConfirm(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Daily Operations</h2>
          <p className="text-slate-400 font-medium">Manage stock cycles and financial daily journals</p>
        </div>
        
        {!activeDay ? (
          <button 
            onClick={() => setShowConfirm('open')}
            className="bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-primary hover:scale-105 active:scale-95 transition-all"
          >
            <Unlock className="w-5 h-5" />
            OPEN STOCK FOR TODAY
          </button>
        ) : (
          <button 
            onClick={() => setShowConfirm('close')}
            className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Lock className="w-5 h-5" />
            CLOSE DAY & LOCK DATA
          </button>
        )}
      </div>

      {activeDay && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[3rem] border-primary/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-32 h-32" />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <CalendarDays className="text-primary w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase">Active Session</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                Started: {format(new Date(activeDay.openedAt), 'PPp')}
              </p>
            </div>
          </div>

          <div className="absolute top-8 right-8 flex gap-2">
            <button 
              onClick={() => downloadJournal(activeDay)}
              className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl hover:bg-primary/20 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
            >
              <Download className="w-4 h-4" />
              Draft Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-slate-500/5 border border-slate-500/10 p-6 rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">Total Sales</p>
              <p className="text-3xl font-black relative z-10">₹{activeDay.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-slate-500/5 border border-slate-500/10 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Purchases</p>
              <p className="text-3xl font-black text-primary">₹{activeDay.totalPurchases.toLocaleString()}</p>
            </div>
            <div className="bg-slate-500/5 border border-slate-500/10 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Expenses</p>
              <p className="text-3xl font-black text-rose-500">₹{activeDay.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-slate-500/5 border border-slate-500/10 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Net Cashflow</p>
              <p className="text-3xl font-black text-emerald-400">₹{(activeDay.totalSales - activeDay.totalExpenses).toLocaleString()}</p>
            </div>
            <div className="bg-slate-500/5 border border-slate-500/10 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Yesterday's Revenue</p>
              <p className="text-3xl font-black text-primary">₹{(pastDays[0]?.totalSales || 0).toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* History */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Operational Journal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastDays.map(day => (
            <div key={day.id} className="glass p-8 rounded-[2.5rem] group transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xl font-black text-white">{format(new Date(day.date), 'MMMM do, yyyy')}</h4>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md mt-1 inline-block">Locked</span>
                </div>
                <button 
                  onClick={() => downloadJournal(day)}
                  className="p-3 bg-slate-500/5 rounded-xl text-slate-500 hover:text-primary transition-colors border border-slate-500/10"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-8 border-t border-slate-500/10 pt-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Revenue</p>
                  <p className="text-lg font-black text-white">₹{day.totalSales.toLocaleString()}</p>
                </div>
                <div className="h-10 w-px bg-slate-500/10" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Net</p>
                  <p className="text-lg font-black text-emerald-400">₹{(day.totalSales * 0.15).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {pastDays.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-500/20 rounded-[3rem]">
              <CalendarDays className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No finalized days in records</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowConfirm(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass w-full max-w-md p-10 rounded-[3rem] text-center"
            >
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl",
                showConfirm === 'open' ? "bg-primary/20 text-primary" : "bg-rose-500/20 text-rose-500"
              )}>
                {showConfirm === 'open' ? <Unlock className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
              </div>
              <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                {showConfirm === 'open' ? 'Open Stock?' : 'Close Day?'}
              </h3>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed px-4 normal-case">
                {showConfirm === 'open' 
                  ? 'This will initialize the operational state and allow billing and purchase activities for today.'
                  : 'Closing the day will lock all invoices and expenditures. Re-opening requires administrative override.'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="bg-slate-500/5 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-500/10 transition-colors uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAction}
                  className={cn(
                    "font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs",
                    showConfirm === 'open' ? "bg-primary text-slate-950 shadow-primary" : "bg-rose-500 text-white shadow-rose-500/10"
                  )}
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SectionAudit module="Daily Operations" />
    </div>
  );
}
