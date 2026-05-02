import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownRight, Package, CreditCard,
  ShoppingCart, History
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { formatCurrency, cn } from '../lib/utils';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

import AuditLogWidget from '../components/AuditLogWidget';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="cyber-card p-6 relative overflow-hidden group shadow-2xl">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    <div className="flex items-start justify-between">
      <div className="z-10 min-w-0 flex-1">
        <p className="text-[var(--text-muted)] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2 truncate">{title}</p>
        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-main)] mb-1 tracking-tighter italic break-all whitespace-normal leading-tight">{value}</h3>
      </div>
      <div className={cn("w-12 h-12 rounded-2xl z-10 flex items-center justify-center shadow-inner", color.replace('text-', 'bg-').concat('/10'), color)}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-6 flex items-center gap-3 z-10 relative">
      <span className={cn(
        "flex items-center text-[10px] font-black uppercase px-2 py-1 rounded-lg border",
        trend === 'up' 
          ? "bg-green-500/10 text-green-500 border-green-500/20" 
          : "bg-red-500/10 text-red-500 border-red-500/20"
      )}>
        {trend === 'up' ? <ArrowUpRight size={10} className="mr-1" /> : <ArrowDownRight size={10} className="mr-1" />}
        {trendValue}%
      </span>
      <span className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.1em] opacity-40">{trend === 'up' ? 'Performance Peak' : 'Minor Dip'}</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { sales, expenses, products, purchases, daySummaries } = useStore();
  const activeSession = daySummaries.find(d => !d.isClosed);
  const lastSession = daySummaries[0];
  const currentSession = activeSession || lastSession;

  const sessionStartTime = currentSession ? new Date(currentSession.startTime) : new Date(0);
  const sessionEndTime = currentSession?.endTime ? new Date(currentSession.endTime) : new Date();
  
  const todaySales = sales
    .filter(sale => {
      const d = new Date(sale.date);
      return d >= sessionStartTime && (!currentSession?.isClosed || d <= sessionEndTime);
    })
    .reduce((sum, sale) => sum + sale.totalAmount, 0);

  const todayExpenses = expenses
    .filter(exp => {
      const d = new Date(exp.date);
      return d >= sessionStartTime && (!currentSession?.isClosed || d <= sessionEndTime);
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const todayPurchases = purchases
    .filter(p => {
      const d = new Date(p.date);
      return d >= sessionStartTime && (!currentSession?.isClosed || d <= sessionEndTime);
    })
    .reduce((sum, p) => sum + p.quantity * p.price, 0);

  const openingStockVal = currentSession?.openingStockValue ?? products.reduce((acc, curr) => acc + curr.openingStock * curr.purchasePrice, 0);
  const closingStockVal = products.reduce((acc, curr) => acc + curr.closingStock * curr.purchasePrice, 0);
  
  const cogs = (openingStockVal + todayPurchases) - closingStockVal;
  const netProfit = todaySales - cogs - todayExpenses;

  const chartData = [...Array(7)].map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const daySales = sales
      .filter(sale => isSameDay(new Date(sale.date), date))
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    return {
      name: format(date, 'EEE'),
      sales: daySales
    };
  });

  return (
    <div className="space-y-12 pb-20 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Mission <span className="text-primary italic">Overview</span></h1>
        <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-[0.2em]">Real-time operational intelligence terminal</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Terminal Revenue" 
          value={formatCurrency(todaySales || 0)} 
          icon={DollarSign} 
          trend="up" 
          trendValue="0.0" 
          color="text-primary"
        />
        <StatCard 
          title="Operational Costs" 
          value={formatCurrency(todayExpenses || 0)} 
          icon={TrendingDown} 
          trend="down" 
          trendValue="0.0" 
          color="text-red-500"
        />
        <StatCard 
          title="Net Liquidity" 
          value={formatCurrency(netProfit || 0)} 
          icon={Wallet} 
          trend={netProfit >= 0 ? "up" : "down"} 
          trendValue="Live" 
          color="text-success"
        />
        <StatCard 
          title="Stock Assets" 
          value={products.length} 
          icon={Package} 
          trend="up" 
          trendValue="NEW" 
          color="text-warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 cyber-card p-8 h-[500px] shadow-2xl group flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <TrendingUp size={20} />
               </div>
               <h3 className="font-black text-xl text-[var(--text-main)] uppercase tracking-tighter italic">Sales Velocity</h3>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-muted)', fontSize: 10, fontWeight: 800}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#22D3EE', fontSize: '12px', textTransform: 'uppercase', fontWeight: '900' }}
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cyber-card p-8 shadow-2xl flex flex-col h-[500px]">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <History size={20} />
             </div>
             <h3 className="font-black text-xl text-[var(--text-main)] uppercase tracking-tighter italic">Recent Logs</h3>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {sales.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-xs font-black uppercase tracking-widest gap-4">
                 <ShoppingCart size={32} className="opacity-20" />
                 No recent activity
              </div>
            ) : (
              sales.slice(0, 10).map((sale, i) => (
                <div key={sale.id || `sale-${i}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group active:scale-95 cursor-pointer">
                  <div className="flex items-center gap-4 text-left min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary transition-colors flex-shrink-0">
                      <CreditCard size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[var(--text-main)] uppercase tracking-tight truncate">{sale.items[0]?.name || 'Bulk Sale'}</p>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                        {sale.paymentMethod} • <span className="text-primary/70">{format(new Date(sale.date), 'HH:mm')}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-primary ml-2">{formatCurrency(sale.totalAmount)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <AuditLogWidget limit={5} className="bg-primary/5 border border-white/5" />
      </div>
    </div>
  );
};

export default Dashboard;
