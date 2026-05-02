import React from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Phone, 
  Mail, 
  Upload,
  FileText,
  X,
  CreditCard,
  CheckCircle2,
  Trash2,
  Edit2,
  Camera,
  IdCard
} from 'lucide-react';
import { useStore, User } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export default function Members() {
  const { users, currentUser, deleteMember, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [modalMode, setModalMode] = React.useState<'add' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode('add');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Members Hub</h2>
          <p className="text-slate-400 font-medium">Full organization registry and credential management</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-primary hover:scale-105 active:scale-95 transition-all text-xs uppercase"
        >
          <UserPlus className="w-5 h-5" />
          ADD MEMBER
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 glass flex items-center gap-3 px-6 py-4 rounded-2xl">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full font-medium placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="glass group rounded-[2.5rem] hover:border-primary/30 transition-all overflow-hidden bg-slate-500/5 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="relative">
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-[2rem] object-cover border-2 border-slate-500/20 shadow-xl"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-[2rem] bg-slate-500/10 border-2 border-slate-500/20 flex items-center justify-center text-xl font-black text-white shadow-xl">
                    {user.name[0]}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center border-4 border-slate-900">
                  <Shield className="w-3 h-3 text-slate-950" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "text-[10px] font-black uppercase px-3 py-1 rounded-full",
                  user.role === 'Super Admin' ? "bg-primary/10 text-primary" : "bg-slate-500/10 text-slate-500"
                )}>
                  {user.role}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="p-2 bg-slate-500/10 border border-slate-500/20 rounded-lg text-slate-500 hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {user.id !== '1' && (
                    <button 
                      onClick={() => deleteMember(user.id)}
                      className="p-2 bg-slate-500/10 border border-slate-500/20 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">{user.name}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 tracking-widest uppercase truncate">{user.email}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-500/10">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                  <Phone className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold">{user.phone}</span>
              </div>
              {user.aadhaarUrl && (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                    <IdCard className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">KYC VERIFIED</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalMode && (
          <MemberModal 
            mode={modalMode}
            user={selectedUser}
            onClose={() => setModalMode(null)} 
          />
        )}
      </AnimatePresence>

      <SectionAudit module="Members" />
    </div>
  );
}

function MemberModal({ mode, user, onClose }: { mode: 'add' | 'edit', user: User | null, onClose: () => void }) {
  const { addMember, updateMember, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Sales' as any,
    phone: user?.phone || '',
    photoUrl: user?.photoUrl || '',
    aadhaarUrl: user?.aadhaarUrl || ''
  });
  
  const [activeStep, setActiveStep] = React.useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'add') {
      addMember(formData);
    } else if (user) {
      updateMember(user.id, formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass w-full max-w-2xl p-10 rounded-[3rem]"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all", activeStep >= 1 ? "bg-primary text-slate-950 shadow-primary" : "bg-slate-500/10")}>
              {activeStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '01'}
            </div>
            <div className="h-px w-8 bg-slate-500/20" />
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all", activeStep >= 2 ? "bg-primary text-slate-950 shadow-primary" : "bg-slate-500/10 border border-slate-500/20")}>
              02
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeStep === 1 ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                  {mode === 'add' ? 'Personnel Identity' : 'Update Credentials'}
                </h3>
                <p className="text-slate-400 font-medium normal-case">Primary contact and system permissions</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@organization.com"
                    className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 12345 67890"
                    className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium appearance-none cursor-pointer border"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Sales">Sales Professional</option>
                    <option value="Inventory Manager">Inventory Lead</option>
                    {mode === 'edit' && user?.role === 'Super Admin' && <option value="Super Admin">Super Admin</option>}
                  </select>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setActiveStep(2)}
                className="w-full bg-slate-500/5 border border-slate-500/10 text-primary font-black py-5 rounded-2xl hover:bg-slate-500/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                Proceed to Verification
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Identity Vault</h3>
                <p className="text-slate-400 font-medium normal-case">Verify credentials with official documentation</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block w-full">Passport Photo</label>
                  <div className="relative group mx-auto">
                    <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-slate-500/5 border-2 border-dashed border-slate-500/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden">
                      {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Passport" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-500" />
                          <span className="text-[8px] font-black text-slate-500 uppercase">Upload</span>
                        </>
                      )}
                      <input 
                        type="url" 
                        className="absolute inset-0 opacity-0 cursor-pointer text-xs"
                        onChange={e => setFormData({ ...formData, photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop' })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block w-full">Identity Document</label>
                  <div className="relative group mx-auto">
                    <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-slate-500/5 border-2 border-dashed border-slate-500/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden">
                      {formData.aadhaarUrl ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-8 h-8 text-primary" />
                          <span className="text-[8px] font-black text-primary uppercase">Attached</span>
                        </div>
                      ) : (
                        <>
                          <IdCard className="w-8 h-8 text-slate-500" />
                          <span className="text-[8px] font-black text-slate-500 uppercase">Verify</span>
                        </>
                      )}
                      <input 
                        type="url" 
                        className="absolute inset-0 opacity-0 cursor-pointer text-xs"
                        onChange={e => setFormData({ ...formData, aadhaarUrl: 'verified-doc-id' })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="flex-1 bg-slate-500/5 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-500/10 transition-colors uppercase tracking-widest text-xs"
                >
                  Edit Profile
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-slate-950 font-black py-5 rounded-2xl hover:opacity-90 transition-colors shadow-xl shadow-primary uppercase tracking-widest text-xs"
                >
                  {mode === 'add' ? 'Confirm Registration' : 'Update Record'}
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
