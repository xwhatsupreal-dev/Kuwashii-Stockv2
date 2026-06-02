import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, ShoppingCart, PackageOpen, Calendar, Clock, Sparkles, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { PurchaseRecord, TopupRecord } from '../types';
import { fetchUserPurchases, fetchUserTopups } from '../queries';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function HistoryModal({ isOpen, onClose, username }: HistoryModalProps) {
  const [activeTab, setActiveTab] = useState<'purchases' | 'topups'>('purchases');
  const [expandedPurchases, setExpandedPurchases] = useState<string[]>([]);
  
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [topups, setTopups] = useState<TopupRecord[]>([]);

  useEffect(() => {
    const loadData = () => {
      if (isOpen && username) {
        fetchUserPurchases(username).then(data => {
          if (data) setPurchases(data);
        });
        fetchUserTopups(username).then(data => {
          if (data) setTopups(data);
        });
      }
    };
    
    loadData();
    
    const handleSync = () => {
       if (isOpen) loadData();
    };
    window.addEventListener('sync-update', handleSync);
    return () => window.removeEventListener('sync-update', handleSync);
  }, [isOpen, username]);

  if (!isOpen) return null;

  // Sort by date, newest first
  const sortedPurchases = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedTopups = [...topups].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 w-full max-w-2xl relative z-10 flex flex-col max-h-[85dvh]"
        >
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">ประวัติการทำรายการ</h3>
                <p className="text-sm text-zinc-400">รายการซื้อสุ่มและประวัติการเติมเงิน</p>
                <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  ระบบ Auto Delete: จะถูกลบอัตโนมัติเมื่ออายุเกิน 3 วัน (ป้องกันข้อมูลเต็ม)
                </p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          <div className="flex gap-2 mb-4 bg-zinc-900/50 p-1.5 rounded-xl shrink-0">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'purchases' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
              <ShoppingCart className="w-4 h-4" /> ซื้อ & สุ่ม ({purchases.length})
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('topups')}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'topups' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
              <DollarSign className="w-4 h-4" /> เติมเงิน ({topups.length})
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 space-y-4">
            {activeTab === 'purchases' && (
              sortedPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <p className="text-zinc-400">ยังไม่มีประวัติการทำรายการ</p>
                </div>
              ) : (
                sortedPurchases.map((purchase) => {
                  const { date, time } = formatDate(purchase.date);
                  const hasGachaDrops = purchase.gachaDrops && purchase.gachaDrops.length > 0;

                  return (
                    <div key={purchase.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                      <div 
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/80 gap-4 ${hasGachaDrops ? 'cursor-pointer hover:bg-zinc-800/80 transition-colors' : ''} ${expandedPurchases.includes(purchase.id) ? 'border-b border-zinc-800/50' : ''}`}
                        onClick={() => {
                          if (hasGachaDrops) {
                            setExpandedPurchases(prev => 
                              prev.includes(purchase.id) 
                                ? prev.filter(id => id !== purchase.id) 
                                : [...prev, purchase.id]
                            );
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border flex-shrink-0 ${hasGachaDrops ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                            {hasGachaDrops ? <PackageOpen className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-zinc-100 font-bold flex items-center gap-2">
                              <span className="truncate max-w-[200px] sm:max-w-[300px]">{purchase.itemName}</span>
                              {purchase.quantity && purchase.quantity > 1 && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono font-medium shrink-0">x{purchase.quantity}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                              <span>ID: {purchase.id.split('-')[1]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                          <div className="font-mono font-bold text-emerald-400 text-right">
                            ฿{purchase.price}
                          </div>
                          {hasGachaDrops && (
                            <div className="text-zinc-500">
                              {expandedPurchases.includes(purchase.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {hasGachaDrops && expandedPurchases.includes(purchase.id) && (
                        <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-zinc-950">
                          <div className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-1.5 uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            ไอเทมที่ได้รับจากกล่องสุ่ม
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.values(
                              purchase.gachaDrops!.reduce((acc: any, drop) => {
                                const key = drop.name;
                                if (!acc[key]) acc[key] = { ...drop, count: 0 };
                                acc[key].count++;
                                return acc;
                              }, {})
                            ).sort((a: any, b: any) => {
                              if (a.isSalt && !b.isSalt) return 1;
                              if (!a.isSalt && b.isSalt) return -1;
                              return 0;
                            }).map((drop: any, idx) => {
                              const isSalt = drop.isSalt;
                              return (
                                <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80 shadow-sm relative overflow-hidden">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner bg-zinc-950 border border-zinc-800 shrink-0"
                                    style={{ color: drop.color || (isSalt ? '#6b7280' : '#F59E0B') }}
                                  >
                                    {isSalt ? '🧂' : '✨'}
                                  </div>
                                  <div className="flex-1 truncate flex justify-between items-center gap-2">
                                    <div className="truncate">
                                      <p className={`text-sm font-bold truncate ${isSalt ? 'text-zinc-400' : 'text-zinc-200'}`}>{drop.name}</p>
                                      <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase truncate">
                                        {isSalt ? 'SALT' : 'DROP REWARD'}
                                      </p>
                                    </div>
                                    {drop.count > 1 && (
                                      <div className="text-xs font-bold font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md shrink-0 border border-zinc-700/50 shadow-sm hidden sm:block">
                                        x{drop.count}
                                      </div>
                                    )}
                                  </div>
                                  {drop.count > 1 && (
                                      <div className="absolute top-0 right-0 sm:hidden text-[10px] font-bold font-mono text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded-bl-lg shrink-0 border-b border-l border-zinc-700/50 backdrop-blur-sm">
                                        x{drop.count}
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Contact Button for winning drops */}
                          {purchase.gachaDrops!.some(drop => !(drop as any).isSalt) && (
                            <div className="mt-3">
                              <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => window.open("https://m.me/DazzRFkaz", "_blank")}
                                className="w-full py-2 px-3 rounded-lg bg-[#0084FF]/10 hover:bg-[#0084FF]/20 text-[#0084FF] hover:text-white border border-[#0084FF]/30 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" fill="none"><path d="M12.0001 2.37891C6.47194 2.37891 1.98926 6.55169 1.98926 11.6974C1.98926 14.5971 3.53594 17.18 5.92211 18.8475V21.6212L8.91893 19.9725C9.89417 20.2526 10.9272 20.4079 12.0001 20.4079C17.5283 20.4079 22.011 16.2351 22.011 11.6974C22.011 6.55169 17.5283 2.37891 12.0001 2.37891ZM12.5701 14.5369L10.3752 12.1979L6.11545 14.5369L10.7938 9.56947L13.0119 11.9084L17.2483 9.56947L12.5701 14.5369Z"/></svg>
                                <span>ติดต่อแอดมินเพื่อเคลมของรางวัล</span>
                              </motion.button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {activeTab === 'topups' && (
              sortedTopups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <p className="text-zinc-400">ยังไม่มีประวัติการเติมเงิน</p>
                </div>
              ) : (
                sortedTopups.map((topup) => {
                  const { date, time } = formatDate(topup.date);
                  return (
                    <div key={topup.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg border flex-shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-zinc-100 font-bold truncate">การเติมเงิน {topup.method}</p>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                            <span>อ้างอิง: {topup.refCode || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`font-mono font-bold text-right ${topup.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {topup.amount > 0 ? '+' : ''}{topup.amount} ฿
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
