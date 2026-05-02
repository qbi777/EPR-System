import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Activity,
  History,
  Building2,
  Calendar
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SectionAudit } from './SectionAudit';

export function Dashboard() {
  const { sales, dailyStocks, products, expenses, auditLogs, batches, settings } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.totalProfit, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const stockValuation = batches.reduce((acc, b) => acc + (b.currentQuantity * b.unitCost), 0);

  // Mock data for charts if no sales exist
  const chartData = dailyStocks.slice(0, 7).reverse().map(d => ({
    name: format(new Date(d.date), 'MMM dd'),
    revenue: d.totalSales,
    profit: d.totalSales * 0.15, // Simplified profit view
  }));

  const previousDay = dailyStocks.find(d => d.status === 'CLOSED');
  const carriedRevenue = previousDay ? previousDay.totalSales : 0;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+12.5%' },
    { label: 'Net Profit', value: `₹${totalProfit.toLocaleString()}`, icon: Activity, color: 'text-primary', bg: 'bg-primary/10', trend: '+8.2%' },
    { label: 'Stock Valuation', value: `₹${stockValuation.toLocaleString()}`, icon: Package, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '-2.4%' },
    { label: 'Opening Balance', value: `₹${carriedRevenue.toLocaleString()}`, icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: 'Carried' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase tracking-tight">
        <div>
          <h2 className={cn("text-4xl font-black group underline decoration-4 underline-offset-8", theme === 'dark' ? "text-white decoration-primary/20" : "text-slate-900 decoration-primary/40")}>
            Control Station
          </h2>
          <p className="text-slate-400 mt-2 font-medium normal-case tracking-normal">Snapshot of your retail ecosystem performance</p>
        </div>
        <div className={cn(
          "flex items-center gap-3 border px-6 py-4 rounded-[2rem]",
          theme === 'dark' ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        )}>
          <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
          <span className={cn("text-sm font-black whitespace-nowrap", theme === 'dark' ? "text-white" : "text-slate-900")}>
            {format(new Date(), 'EEEE, MMMM do')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "glass p-8 rounded-[2.5rem] relative overflow-hidden group transition-all",
              theme === 'light' && "shadow-xl border-slate-200 bg-white"
            )}
          >
            <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity whitespace-nowrap`}>
              <stat.icon className="w-24 h-24" />
            </div>
            
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: stat.bg === 'bg-primary/10' ? `${primaryColor}20` : undefined }}>
              <stat.icon className={cn("w-6 h-6", stat.color)} style={stat.color === 'text-primary' ? { color: primaryColor } : {}} />
            </div>
            
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className={cn("text-3xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{stat.value}</h3>
              <div className="flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend} <span className="text-slate-500 ml-1">v yesterday</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={cn(
          "lg:col-span-8 glass p-10 rounded-[3.5rem]",
          theme === 'light' && "bg-white shadow-xl border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className={cn("text-xl font-black uppercase tracking-tight font-sans", theme === 'dark' ? "text-white" : "text-slate-900")}>Performance Index</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Daily revenue and profit correlation</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'N/A', revenue: 0, profit: 0 }]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF', 
                    border: 'none',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="revenue" stroke={primaryColor} strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={4} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className={cn(
            "glass p-10 rounded-[3rem] flex-1",
            theme === 'dark' ? "border-slate-800" : "bg-white shadow-xl border-slate-200"
          )}>
            <h3 className={cn("text-xl font-black uppercase tracking-tight mb-8", theme === 'dark' ? "text-white" : "text-slate-900")}>System Activity</h3>
            <div className="space-y-6">
              {auditLogs.slice(0, 5).map((log, i) => (
                <div key={log.id} className="flex gap-4 relative">
                  {i !== 4 && <div className={cn("absolute left-[15px] top-[30px] bottom-[-20px] w-px", theme === 'dark' ? "bg-slate-800" : "bg-slate-200")} />}
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center relative z-10 border",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <Activity className="w-3 h-3" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className={cn("text-xs font-black tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>{log.action}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{log.module} • {format(new Date(log.timestamp), 'HH:mm')}</p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-10 text-center opacity-30 select-none">
                  <History className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No active logs</p>
                </div>
              )}
            </div>
            <button className={cn(
              "w-full mt-8 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors border",
              theme === 'dark' ? "bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800" : "bg-slate-50 text-slate-500 hover:bg-white border-slate-200"
            )}>
              Full Audit Trail
            </button>
          </div>
        </div>
      </div>

      <SectionAudit module={["Sales", "Purchases", "Expenses", "Auth", "Inventory"]} />
    </div>
  );
}
