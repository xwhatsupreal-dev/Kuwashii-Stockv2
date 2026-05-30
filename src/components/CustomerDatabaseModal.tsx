import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Search, DollarSign, Clock, Package, Edit2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { UserData } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewUserHistory: (username: string) => void;
}

export const CustomerDatabaseModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onViewUserHistory }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [editingBalanceUser, setEditingBalanceUser] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState('');

  // Load from multiple sources optionally, but focus on KUWASHII_V2_USERS
  useEffect(() => {
    const loadData = () => {
      const usersDataV2 = localStorage.getItem('KUWASHII_V2_USERS');
      let parsedUsers: Record<string, UserData> = {};
      
      if (usersDataV2) {
        parsedUsers = JSON.parse(usersDataV2);
        // Ensure username exists on all objects
        Object.keys(parsedUsers).forEach(key => {
          if (!parsedUsers[key].username) {
             parsedUsers[key].username = key;
          }
        });
      }
      
      // Fallback migration mapping for any users still stuck in V1
      const usersDataV1 = localStorage.getItem('KUWASHII_USERS');
      if (usersDataV1) {
        const v1 = JSON.parse(usersDataV1);
        let hasNewMigrations = false;
        Object.keys(v1).forEach(username => {
          if (!parsedUsers[username]) {
            parsedUsers[username] = {
              username,
              password: typeof v1[username] === 'string' ? v1[username] : (v1[username]?.password || ''),
              balance: 0,
              joinDate: v1[username]?.createdAt || new Date().toISOString(),
              purchases: []
            };
            hasNewMigrations = true;
          }
        });
        if (hasNewMigrations) {
          localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(parsedUsers));
        }
      }

      setUsers(Object.values(parsedUsers));
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

  const handleUpdateBalance = (username: string) => {
    const amount = Number(newBalance);
    if (isNaN(amount) || amount < 0) return;

    const usersDataV2 = localStorage.getItem('KUWASHII_V2_USERS');
    if (usersDataV2) {
      const parsedUsers = JSON.parse(usersDataV2);
      if (parsedUsers[username]) {
        const oldBalance = parsedUsers[username].balance || 0;
        const difference = amount - oldBalance;
        parsedUsers[username].balance = amount;
        
        if (difference !== 0) {
          parsedUsers[username].topups = [
            ...(parsedUsers[username].topups || []),
            {
              id: `manual-${Date.now()}`,
              amount: difference,
              date: new Date().toISOString(),
              method: difference > 0 ? 'Admin เพิ่มเครดิต' : 'Admin ลดเครดิต',
              refCode: 'manual'
            }
          ];
        }
        
        localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(parsedUsers));
        setUsers(Object.values(parsedUsers));
      }
    }
    setEditingBalanceUser(null);
    setNewBalance('');
  };

  const filteredUsers = users.filter(u => u && (u.username || '').toLowerCase().includes((search || '').toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-900/40 shrink-0">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
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
                    className="w-full bg-zinc-900 border border-zinc-800 py-2 pl-10 pr-4 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2">
                   <span className="text-zinc-500 text-xs">ลูกค้าทั้งหมด:</span>
                   <span className="text-indigo-400 font-black">{users.length} บัญชี</span>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                  <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 font-bold">ไม่พบรายชื่อลูกค้าในระบบ</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user, index) => (
                    <div key={user.username || index} className="bg-zinc-900/20 border border-zinc-800 rounded-2xl overflow-hidden transition-colors hover:bg-zinc-900/40">
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
                            <div className="text-xs text-zinc-500 flex items-center gap-3 mt-1">
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> เข้าร่วม: {user.joinDate ? new Date(user.joinDate).toLocaleDateString('th-TH') : '-'}</span>
                               <span className="flex items-center gap-1 text-emerald-400/70"><History className="w-3 h-3" /> ยอดซื้อ: {user.purchases?.length || 0} ครั้ง</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                           {editingBalanceUser === user.username ? (
                             <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={newBalance}
                                  onChange={(e) => setNewBalance(e.target.value)}
                                  className="w-24 bg-zinc-950 border border-zinc-700 py-1.5 px-2 text-sm text-white rounded-lg focus:outline-none focus:border-emerald-500"
                                  placeholder="เครดิต"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateBalance(user.username)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                  บันทึก
                                </button>
                                <button
                                  onClick={() => setEditingBalanceUser(null)}
                                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                                >
                                  ยกเลิก
                                </button>
                             </div>
                           ) : (
                             <>
                               <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                                 <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                 <span className="text-emerald-400 font-mono font-bold">{user.balance || 0}</span>
                               </div>
                               {user.username !== 'Kuwashii_admin' && (
                                 <button 
                                   onClick={() => { setEditingBalanceUser(user.username); setNewBalance(String(user.balance || 0)); }}
                                   className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                                   title="แก้ไขยอดเงิน (เติมเครดิต)"
                                 >
                                   <Edit2 className="w-4 h-4" />
                                 </button>
                               )}
                               <button
                                 onClick={() => onViewUserHistory(user.username)}
                                 className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                                 title="ประวัติการทำรายการ"
                               >
                                 <History className="w-4 h-4" />
                               </button>
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
