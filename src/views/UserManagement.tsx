import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Shield, Plus, Mail, Phone, MoreVertical, X, Upload, Eye, FileText, Users, Trash2 } from 'lucide-react';
import { cn, generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import AuditLogWidget from '../components/AuditLogWidget';

const UserManagement: React.FC = () => {
  const { users, roles, addUser, removeUser } = useStore();
  const [activeView, setActiveView] = useState<'members' | 'roles'>('members');
  const [showAddUser, setShowAddUser] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    role: 'sales',
    email: '',
    phone: '',
    username: ''
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    
    addUser({
      ...newUser,
      username: newUser.email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.name}`
    });
    
    setNewUser({ name: '', role: 'sales', email: '', phone: '', username: '' });
    setShowAddUser(false);
  };

  return (
    <div className="space-y-12 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Neural <span className="text-primary italic">Network</span></h1>
            <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-[0.2em] opacity-60">Team Logistics & Privilege Matrix</p>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
          <button 
            onClick={() => setActiveView('members')}
            className={cn(
              "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeView === 'members' ? "bg-primary text-[#020617] shadow-lg shadow-cyan-500/20" : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            Operatives
          </button>
          <button 
            onClick={() => setActiveView('roles')}
            className={cn(
              "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeView === 'roles' ? "bg-primary text-[#020617] shadow-lg shadow-cyan-500/20" : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            Access Tiers
          </button>
        </div>
      </div>

      {activeView === 'members' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <button 
            onClick={() => setShowAddUser(true)}
            className="border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-12 rounded-[40px] hover:border-primary/50 hover:bg-primary/5 transition-all text-[var(--text-muted)] group relative overflow-hidden"
          >
             <div className="w-20 h-20 rounded-full bg-[var(--bg-main)] flex items-center justify-center group-hover:scale-110 transition-transform mb-6 shadow-inner border border-white/5">
                <Plus size={40} className="text-primary group-hover:rotate-90 transition-transform" />
             </div>
             <p className="font-black text-xl text-[var(--text-main)] uppercase italic tracking-tight">Deploy Operative</p>
             <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mt-1">Assign unique neural signature</p>
          </button>

          {users.map((user) => (
            <div key={user.id} className="cyber-card p-10 flex flex-col items-center text-center relative group shadow-2xl bg-primary/5">
              <button 
                onClick={() => removeUser(user.id)}
                className="absolute top-6 right-6 text-[var(--text-muted)] p-2 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:scale-110"
              >
                <Trash2 size={20} />
              </button>
              
              <div className="w-28 h-28 rounded-full bg-[var(--bg-main)] border-4 border-white/5 p-1 mb-6 relative group-hover:border-primary/30 transition-colors shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-main)] flex items-center justify-center">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                   ) : (
                     <span className="text-4xl font-black text-primary italic">{user.name.charAt(0)}</span>
                   )}
                </div>
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-4 border-[var(--bg-card)] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>

              <h3 className="text-2xl font-black text-[var(--text-main)] italic tracking-tighter uppercase mb-1">{user.name}</h3>
              <div className="mt-1 px-4 py-1 bg-primary/10 border border-primary/20 rounded-full">
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">{user.role}</span>
              </div>
              
              <div className="mt-8 space-y-4 w-full">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-primary/50" />
                    <span className="text-[11px] font-bold text-[var(--text-muted)] lowercase">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-primary/50" />
                    <span className="text-[11px] font-bold text-[var(--text-muted)]">{user.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4 w-full">
                 <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-[var(--text-main)] italic">
                    Archives
                 </button>
                 <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-primary text-[#020617] rounded-xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/10 italic">
                    Sync Link
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <button className="border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-12 rounded-[40px] text-[var(--text-muted)] hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <Shield size={40} className="mb-4 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-black text-[var(--text-main)] uppercase italic tracking-tight text-xl">Encoded Tier</p>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mt-1">Define customized access mask</p>
           </button>
           {roles.map(role => (
             <div key={role.id} className="cyber-card p-10 space-y-8 bg-primary/5 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-inner border border-primary/20">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-[var(--text-main)] uppercase italic tracking-tighter leading-none">{role.name}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">Security Level: {role.id === 'admin' ? 'Total' : 'Restricted'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] opacity-50">Authorized Nodes</p>
                   <div className="flex flex-wrap gap-2">
                      {role.permissions.map(p => (
                        <span key={p} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/50 uppercase tracking-widest">
                          {p.replace('_', ' ')}
                        </span>
                      ))}
                   </div>
                </div>
                <button className="w-full py-5 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-[#020617] hover:border-primary transition-all text-[var(--text-main)] italic group">
                  Override Permissions
                </button>
             </div>
           ))}
        </div>
      )}

      <div className="mt-8">
        <AuditLogWidget entity="USER" limit={5} className="bg-[var(--bg-card)]/40" />
      </div>

      <AnimatePresence>
         {showAddUser && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddUser(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-xl rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Registration</h2>
                  <button onClick={() => setShowAddUser(false)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors"><X size={24} /></button>
                </div>
                <form className="space-y-6" onSubmit={handleAddUser}>
                   <div className="flex justify-center mb-8">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-primary cursor-pointer transition-all">
                         <Upload size={24} />
                         <span className="text-[10px] font-bold mt-1">PHOTO</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Full Name</label>
                        <input 
                          required
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-[var(--text-main)] text-sm" 
                          placeholder="John Doe" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Role</label>
                        <select 
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-[var(--text-main)] text-sm appearance-none"
                        >
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                      <div>
                         <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Email Address</label>
                         <input 
                           required
                           type="email" 
                           value={newUser.email}
                           onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                           className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-[var(--text-main)] text-sm" 
                           placeholder="john@example.com" 
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Phone Number</label>
                         <input 
                           type="tel" 
                           value={newUser.phone}
                           onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                           className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-[var(--text-main)] text-sm" 
                           placeholder="+1 (555) 000-0000" 
                         />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Upload ID Document</label>
                        <div className="w-full py-6 border-2 border-dashed border-[var(--border-color)] rounded-xl flex items-center justify-center gap-3 text-[var(--text-muted)] hover:border-primary/50 transition-colors cursor-pointer">
                           <FileText size={20} /> <span className="text-sm font-medium">Click to select file</span>
                        </div>
                      </div>
                   </div>
                   <button type="submit" className="w-full py-4 bg-primary text-[#020617] rounded-xl font-black uppercase tracking-widest shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-95 transition-all">
                      REGISTER TEAM MEMBER
                   </button>
                </form>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
