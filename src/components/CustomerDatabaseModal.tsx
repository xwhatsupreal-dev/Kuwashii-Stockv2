import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Search, DollarSign, Clock, Package, Edit2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabase';
import { UserData } from '../types';
import { sendDiscordTopupEmbed } from '../discord';
import { getSystemConfig } from '../queries';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewUserHistory: (username: string) => void;
  appScreen?: string;
}

export const CustomerDatabaseModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onViewUserHistory, appScreen = 'ASTD' }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [editingBalanceUser, setEditingBalanceUser] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);

      // Load from multiple sources optionally, but focus on KUWASHII_V2_USERS
  useEffect(() => {
    const loadData = async () => {
      const [{ data: profiles, error }, { data: purchases }, { data: topups }] = await Promise.all([
        supabase.from('profiles').select('*').neq('username', 'Kuwashii_admin').order('created_at', { ascending: false }),
        supabase.from('purchases').select('username'),
        supabase.from('topups').select('username')
      ]);

      if (profiles && !error) {
        const pCounts: Record<string, number> = {};
        const tCounts: Record<string, number> = {};
        if (purchases) purchases.forEach((p: any) => pCounts[p.username] = (pCounts[p.username] || 0) + 1);
        if (topups) topups.forEach((t: any) => tCounts[t.username] = (tCounts[t.username] || 0) + 1);

        const arr = profiles.map((d: any) => ({
          username: d.username,
          email: d.email,
          balance: Number(d.balance),
          balance_rov: Number(d.balance_rov),
          joinDate: d.created_at,
          password: d.password,
          purchaseCount: pCounts[d.username] || 0,
          topupCount: tCounts[d.username] || 0,
        }));
        setUsers(arr);
      }
    };

    if (isOpen) {
      loadData();
    }
    
    // Listen for realtime changes pushed by Supabase
    const handleSync = () => {
      if (isOpen) loadData();
    };
    window.addEventListener('sync-update', handleSync);
    return () => window.removeEventListener('sync-update', handleSync);
  }, [isOpen]);

  const handleDeleteUserByAdmin = async (username: string) => {
    const { error } = await supabase.from('profiles').delete().eq('username', username);
    if (!error) {
      setUsers(users.filter(u => u.username !== username));
      setConfirmDeleteUser(null);
    }
  };

  const handleUpdateBalance = async (username: string) => {
    const amount = Number(newBalance);
    if (isNaN(amount) || amount < 0) return;

    const user = users.find(u => u.username === username);
    if (user) {
      const balanceField = appScreen === 'ROV' ? 'balance_rov' : 'balance';
      const oldBalance = user[balanceField] || 0;
      const difference = amount - oldBalance;
      
      const { error } = await supabase.from('profiles').update({ [balanceField]: amount }).eq('username', username);
      if (!error) {
        setUsers(users.map(u => u.username === username ? { ...u, [balanceField]: amount } : u));
        
        if (difference !== 0) {
          const targetGame = appScreen;
          await supabase.from('topups').insert([{
            username: username,
            amount: difference,
            method: difference > 0 ? 'Admin เพิ่มเครดิต' : 'Admin ลดเครดิต',
            game: targetGame
          }]);
          
          if (difference > 0) {
            sendDiscordTopupEmbed(username, difference, 'Admin (ระบบ)', amount, true);
            
            const configData = await getSystemConfig();
            if (targetGame === 'ASTD') {
              const currentRev = configData ? Number(configData.global_rev_astd || 0) : 0;
              await supabase.from('system_config').upsert({ id: 'main', global_rev_astd: currentRev + difference });
            } else {
              const currentRev = configData ? Number(configData.global_revenue_aotr || 0) : 0;
              await supabase.from('system_config').upsert({ id: 'main', global_revenue_aotr: currentRev + difference });
            }
          }

          window.dispatchEvent(new Event('sync-update'));
        }
      }
    }
    
    setEditingBalanceUser(null);
    setNewBalance('');
  };

  const filteredUsers = users
    .filter(u => u && (u.username || '').toLowerCase().includes((search || '').toLowerCase()))
    .sort((a, b) => (a.username || '').localeCompare(b.username || ''));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 "
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[85dvh] bg-zinc-950 border border-white/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-900  shrink-0">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">ระบบจัดการฐานลูกค้า</h2>
                  <p className="text-sm text-zinc-500 font-mono mt-1">
                    Customer Database Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto font-sans flex-1">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อผู้ใช้..."
                    className="w-full bg-zinc-900 border border-white/5 py-2 pl-10 pr-4 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                   <span className="text-zinc-500 text-xs">ลูกค้าทั้งหมด:</span>
                   <span className="text-indigo-400 font-black">{users.length} บัญชี</span>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-white/5/50">
                  <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 font-bold">ไม่พบรายชื่อลูกค้าในระบบ</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user, index) => (
                    <div key={user.username || index} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden transition-colors hover:bg-zinc-900 ">
                      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black shrink-0">
                            {(user.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base flex items-center gap-2">
                               {user.username || 'Unknown'}
                               {user.username === 'Kuwashii_admin' && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-md border border-amber-500/30">Admin</span>}
                            </h3>
                            {user.email && (
                              <div className="text-[10px] text-zinc-400 font-sans mt-0.5">{user.email}</div>
                            )}
                            <div className="flex flex-col gap-1 mt-1">
                               <div className="text-[10px] text-zinc-500 flex flex-wrap items-center gap-3 mt-1">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> เข้าร่วม: {user.joinDate ? new Date(user.joinDate).toLocaleDateString('th-TH') : '-'}</span>
                               </div>
                               <div className="text-[10px] text-zinc-500 flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1 text-emerald-400/70"><History className="w-3 h-3" /> ยอดซื้อ: {user.purchaseCount || 0} ครั้ง</span>
                                  <span className="flex items-center gap-1 text-amber-400/70"><History className="w-3 h-3" /> ยอดเติม: {user.topupCount || 0} ครั้ง</span>
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-white/5/50">
                           {editingBalanceUser === user.username ? (
                             <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={newBalance}
                                  onChange={(e) => setNewBalance(e.target.value)}
                                  className="w-24 bg-zinc-950 border border-white/10 py-1.5 px-2 text-sm text-white rounded-lg focus:outline-none focus:border-emerald-500"
                                  placeholder="เครดิต"
                                  autoFocus
                                />
                                <motion.button whileTap={{ scale: 0.95 }}
                                  onClick={() => handleUpdateBalance(user.username)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                  บันทึก
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }}
                                  onClick={() => setEditingBalanceUser(null)}
                                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                                >
                                  ยกเลิก
                                </motion.button>
                             </div>
                           ) : (
                             <>
                               <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                                 <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                 <span className="text-emerald-400 font-mono font-bold">{((appScreen === 'ROV' ? user.balance_rov : user.balance) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                               </div>
                               {user.username !== 'Kuwashii_admin' && (
                                 confirmDeleteUser === user.username ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-red-400 font-bold hidden sm:inline">ยืนยันลบ?</span>
                                      <motion.button whileTap={{ scale: 0.95 }} 
                                        onClick={() => handleDeleteUserByAdmin(user.username)}
                                        className="py-1 px-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg transition-colors shadow-lg shadow-red-500/20"
                                      >
                                        ลบ
                                      </motion.button>
                                      <motion.button whileTap={{ scale: 0.95 }} 
                                        onClick={() => setConfirmDeleteUser(null)}
                                        className="py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold rounded-lg transition-colors border border-white/10"
                                      >
                                        ยกเลิก
                                      </motion.button>
                                    </div>
                                 ) : (
                                   <>
                                     <motion.button whileTap={{ scale: 0.95 }} 
                                       onClick={() => { setEditingBalanceUser(user.username); setNewBalance(String((appScreen === 'ROV' ? user.balance_rov : user.balance) || 0)); }}
                                       className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                                       title="แก้ไขยอดเงิน (เติมเครดิต)"
                                     >
                                       <Edit2 className="w-4 h-4" />
                                     </motion.button>
                                     <motion.button whileTap={{ scale: 0.95 }}
                                       onClick={() => setConfirmDeleteUser(user.username)}
                                       className="p-1.5 rounded-lg hover:bg-red-900/50 text-red-500/70 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                       title="ลบบัญชีผู้ใช้นี้ถาวร"
                                     >
                                       <X className="w-4 h-4" />
                                     </motion.button>
                                   </>
                                 )
                               )}
                               <motion.button whileTap={{ scale: 0.95 }}
                                 onClick={() => onViewUserHistory(user.username)}
                                 className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                                 title="ประวัติการทำรายการ"
                               >
                                 <History className="w-4 h-4" />
                               </motion.button>
                             </>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
