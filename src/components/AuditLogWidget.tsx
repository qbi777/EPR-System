import React from 'react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';
import { History, User as UserIcon, Clock, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { AuditLog } from '../types';

interface AuditLogWidgetProps {
  entity?: AuditLog['entity'];
  limit?: number;
  className?: string;
}

const AuditLogWidget: React.FC<AuditLogWidgetProps> = ({ entity, limit = 10, className }) => {
  const { auditLogs } = useStore();
  
  const filteredLogs = entity 
    ? auditLogs.filter(log => log.entity === entity)
    : auditLogs;

  const displayLogs = filteredLogs.slice(0, limit);

  return (
    <div className={cn("cyber-card shadow-2xl flex flex-col overflow-hidden max-w-full", className)}>
      <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          <History size={20} className="text-primary" />
          <h3 className="font-black text-white uppercase italic tracking-tighter text-sm">System Audit Ledger</h3>
        </div>
        <span className="text-[9px] bg-primary/10 text-primary px-3 py-1 rounded-full uppercase font-black border border-primary/20">
          {displayLogs.length} Transactions
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar max-h-[500px]">
        {displayLogs.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-20 gap-4">
            <Activity size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">No System Telemetry</p>
          </div>
        ) : (
          displayLogs.map(log => (
            <div key={log.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 group hover:border-primary/30 transition-all hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border",
                    log.action === 'CREATE' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                    log.action === 'UPDATE' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    log.action === 'DELETE' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    "bg-primary/20 text-primary border-primary/30"
                  )}>
                    {log.action}
                  </span>
                  <span className="text-[10px] text-primary/70 font-black uppercase tracking-widest opacity-60 italic">{log.entity}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold">
                  <Clock size={12} className="text-primary/40" />
                  {format(new Date(log.timestamp), 'HH:mm')}
                </div>
              </div>
              <p className="text-xs text-white font-medium leading-relaxed italic opacity-80">"{log.details}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[8px]">
                   {log.userName.charAt(0)}
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{log.userName}</span>
                <div className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                <span className="text-[10px] text-primary font-black uppercase tracking-widest opacity-60">{log.userRole}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLogWidget;
