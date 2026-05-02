import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Building2, Palette, Upload, Save, Check, Settings, Moon, Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import AuditLogWidget from '../components/AuditLogWidget';
import { THEMES } from '../constants';

const SettingsView: React.FC = () => {
  const { company, settings, updateSettings, updateCompany, resetStore } = useStore();
  const [activeTab, setActiveTab] = useState<'company' | 'theme' | 'audit'>('company');

  const handleSystemReset = () => {
    // Double confirmation for safety
    const confirmed = window.confirm("CRITICAL: This will PERMANENTLY WIPE all records, products, and logs in the CLOUD. This cannot be undone. Proceed?");
    if (confirmed) {
      const doubleConfirmed = window.confirm("FINAL WARNING: Are you absolutely sure you want to initialize a factory reset?");
      if (doubleConfirmed) {
        resetStore();
      }
    }
  };

  return (
    <div className="space-y-12 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Terminal <span className="text-primary italic">Config</span></h1>
            <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-[0.2em] opacity-60">System identity & Branding protocols</p>
          </div>
        </div>
        <button className="hidden md:flex bg-primary text-[#020617] font-black px-10 py-5 rounded-2xl items-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-cyan-500/20 uppercase text-xs tracking-widest">
          <Save size={20} /> Update Terminal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Navigation Rail */}
        <div className="lg:col-span-1 space-y-4">
          <button 
            onClick={() => setActiveTab('company')}
            className={cn(
              "w-full flex items-center gap-6 px-8 py-6 rounded-3xl transition-all border group",
              activeTab === 'company' 
                ? "bg-primary/10 text-primary border-primary/20 cyber-glow" 
                : "text-[var(--text-muted)] hover:bg-primary/5 border-transparent"
            )}
          >
            <Building2 size={24} className={cn("transition-colors", activeTab === 'company' ? "text-primary" : "group-hover:text-white")} />
            <span className="font-black uppercase tracking-widest text-sm">Corporate Identity</span>
          </button>
          <button 
            onClick={() => setActiveTab('theme')}
            className={cn(
              "w-full flex items-center gap-6 px-8 py-6 rounded-3xl transition-all border group",
              activeTab === 'theme' 
                ? "bg-primary/10 text-primary border-primary/20 cyber-glow" 
                : "text-[var(--text-muted)] hover:bg-primary/5 border-transparent"
            )}
          >
            <Palette size={24} className={cn("transition-colors", activeTab === 'theme' ? "text-primary" : "group-hover:text-white")} />
            <span className="font-black uppercase tracking-widest text-sm">Visual Overrides</span>
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={cn(
              "w-full flex items-center gap-6 px-8 py-6 rounded-3xl transition-all border group",
              activeTab === 'audit' 
                ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                : "text-[var(--text-muted)] hover:bg-red-500/5 border-transparent"
            )}
          >
            <Settings size={24} className={cn("transition-colors", activeTab === 'audit' ? "text-red-500" : "group-hover:text-red-400")} />
            <span className="font-black uppercase tracking-widest text-sm">Security & Audit</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'company' && (
            <section className="cyber-card p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 bg-primary/5 shadow-2xl">
              <div className="flex items-center gap-4">
                <Building2 size={28} className="text-primary" />
                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Entity Profile</h2>
              </div>
              
              <div className="flex items-center gap-10 pb-10 border-b border-[var(--border-color)]">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-3xl bg-[var(--bg-main)] border border-white/5 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary/50 transition-all">
                    {company.logo ? (
                      <img src={company.logo} alt="Logo" className="w-full h-full object-cover opacity-80 group-hover:opacity-20 transition-all scale-90 group-hover:scale-75" />
                    ) : (
                      <Building2 size={48} className="text-[var(--text-muted)] opacity-20" />
                    )}
                    <Upload className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-all text-primary" size={32} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-[#020617] p-2 rounded-xl border-4 border-[var(--bg-card)] shadow-lg">
                    <Check size={16} />
                  </div>
                </div>
                <div className="flex-1">
                   <p className="font-black text-2xl mb-2 text-[var(--text-main)] italic truncate">{company.name}</p>
                   <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-60">Verified Node: RF-00X-DELTA</p>
                   <button className="mt-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black text-primary hover:bg-primary/20 uppercase tracking-widest transition-all">Upload New Signature</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 leading-none">Terminal Designation</label>
                    <input 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl py-4 px-5 focus:border-primary/50 transition-all text-[var(--text-main)] outline-none font-bold uppercase tracking-widest text-sm" 
                      value={company.name}
                      onChange={(e) => updateCompany({ name: e.target.value })}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 leading-none">Fiscal Identifier (GSTIN)</label>
                    <input 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl py-4 px-5 focus:border-primary/50 transition-all uppercase placeholder:italic text-[var(--text-main)] outline-none font-bold tracking-widest text-sm placeholder:text-[var(--text-muted)]/20" 
                      placeholder="SCANNING GSTIN..."
                      value={company.gstin || ''}
                      onChange={(e) => updateCompany({ gstin: e.target.value })}
                    />
                 </div>
                 <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 leading-none">Physical Coordinates</label>
                    <textarea 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl py-4 px-5 focus:border-primary/50 transition-all resize-none text-[var(--text-main)] outline-none font-bold text-sm uppercase tracking-wider" 
                      rows={2}
                      value={company.address}
                      onChange={(e) => updateCompany({ address: e.target.value })}
                    />
                 </div>
              </div>
            </section>
          )}

          {activeTab === 'theme' && (
            <section className="cyber-card p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 bg-primary/5 shadow-2xl">
              <div className="flex items-center gap-4">
                 <Palette size={28} className="text-primary" />
                 <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Visual Overrides</h2>
              </div>
              
              <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-6 block">Core Spectrum Selector</label>
                       <div className="flex flex-wrap gap-4">
                          {THEMES.map(t => (
                            <button
                              key={t.id}
                              onClick={() => updateSettings({ theme: t.id as any })}
                              className={cn(
                                "w-12 h-12 rounded-2xl border-4 transition-all p-1 flex items-center justify-center relative group/color",
                                settings.theme === t.id ? "border-primary scale-110 shadow-[0_0_15px_var(--color-primary)]" : "border-[var(--border-color)] hover:border-primary/30"
                              )}
                              title={t.name}
                            >
                              <div className="w-full h-full rounded-xl shadow-inner" style={{ backgroundColor: t.primary }} />
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-6 block">Interface Luminance</label>
                       <div className="flex gap-4">
                          <button
                            onClick={() => updateSettings({ darkMode: true })}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all",
                              settings.darkMode 
                                ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(34,211,238,0.2)] text-primary" 
                                : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary/30"
                            )}
                          >
                            <Moon size={24} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Midnight Mode</span>
                          </button>
                          <button
                            onClick={() => updateSettings({ darkMode: false })}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all",
                              !settings.darkMode 
                                ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(34,211,238,0.2)] text-primary" 
                                : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary/30"
                            )}
                          >
                            <Sun size={24} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Daylight Mode</span>
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[var(--border-color)]">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 block">System Integration Status</label>
                     <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]" />
                           <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Neural Link Stable</span>
                        </div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50 italic">Latency: 4ms</span>
                     </div>
                  </div>
              </div>
            </section>
          )}

          {activeTab === 'audit' && (
            <section className="cyber-card p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 bg-red-500/5 shadow-2xl">
              <div className="flex items-center gap-4">
                 <Settings size={28} className="text-red-500" />
                 <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Security Control</h2>
              </div>
              
              <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-red-500 uppercase tracking-tighter italic">Factory Link Override</h3>
                  <p className="text-xs text-[var(--text-muted)] font-bold leading-relaxed opacity-60 uppercase tracking-widest">
                    Triggering this protocol will bypass all data encryption and permanently purge the terminal's local storage. This will erase all products, invoices, and expenses registered via this browser.
                  </p>
                </div>
                
                <button 
                  onClick={handleSystemReset}
                  className="w-full bg-red-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 uppercase tracking-[0.2em] text-xs"
                >
                  Terminate Local Database
                </button>
              </div>

              <div className="pt-6 border-t border-[var(--border-color)]">
                <AuditLogWidget limit={5} className="bg-red-500/5 border-red-500/10" />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
