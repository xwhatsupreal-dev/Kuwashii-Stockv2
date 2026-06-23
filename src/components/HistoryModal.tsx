import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, ShoppingCart, PackageOpen, Calendar, Clock, Sparkles, DollarSign, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
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
          className="absolute inset-0 bg-black/80 "
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-zinc-950 border border-white/5 rounded-3xl shadow-2xl p-6 w-full max-w-2xl relative z-10 flex flex-col max-h-[85dvh]"
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
                  ระบบ Auto Delete: จะถูกลบอัตโนมัติเมื่ออายุเกิน 7 วัน (ป้องกันข้อมูลเต็ม)
                </p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          <div className="flex gap-2 mb-4 bg-zinc-900 p-1.5 rounded-xl shrink-0">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'purchases' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
            >
              <ShoppingCart className="w-4 h-4" /> ซื้อ & สุ่ม ({purchases.length})
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('topups')}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'topups' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
            >
              <DollarSign className="w-4 h-4" /> เติมเงิน ({topups.length})
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 space-y-4">
            {activeTab === 'purchases' && (
              sortedPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <p className="text-zinc-400">ยังไม่มีประวัติการทำรายการ</p>
                </div>
              ) : (
                sortedPurchases.map((purchase) => {
                  const { date, time } = formatDate(purchase.date);
                  const hasGachaDrops = purchase.gachaDrops && purchase.gachaDrops.length > 0;
                  const hasCredentialData = !!purchase.credentialData;
                  const canExpand = hasGachaDrops || hasCredentialData;

                  return (
                    <div key={purchase.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                      <div 
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900 gap-4 ${canExpand ? 'cursor-pointer hover:bg-zinc-800 transition-colors' : ''} ${expandedPurchases.includes(purchase.id) ? 'border-b border-white/5/50' : ''}`}
                        onClick={() => {
                          if (canExpand) {
                            setExpandedPurchases(prev => 
                              prev.includes(purchase.id) 
                                ? prev.filter(id => id !== purchase.id) 
                                : [...prev, purchase.id]
                            );
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border flex-shrink-0 ${(hasGachaDrops || hasCredentialData) ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                            {hasGachaDrops ? <PackageOpen className="w-5 h-5" /> : hasCredentialData ? <Sparkles className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-zinc-100 font-bold flex items-center gap-2">
                              {purchase.game && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${purchase.game === 'ROV' ? 'bg-amber-500/20 text-amber-500' : purchase.game === 'AOTR' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                                  {purchase.game}
                                </span>
                              )}
                              <span className="truncate max-w-[200px] sm:max-w-[300px]">{purchase.itemName}</span>
                              {purchase.quantity && purchase.quantity > 1 && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono font-medium shrink-0">x{purchase.quantity}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                              <span>ID: {purchase.id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                          <div className={`font-mono font-bold text-right ${purchase.game === 'ROV' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {purchase.game === 'ROV' ? '' : '฿'}{purchase.price} {purchase.game === 'ROV' ? 'เครดิต' : ''}
                          </div>
                          {canExpand && (
                            <div className="text-zinc-500">
                              {expandedPurchases.includes(purchase.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {hasCredentialData && expandedPurchases.includes(purchase.id) && (
                        <div className="p-4 bg-emerald-950/20 border-b border-white/5/50">
                          <div className="text-xs font-semibold text-emerald-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest font-mono">
                            {purchase.game === 'ROV' ? 'Username:Password' : 'ข้อมูลบัญชี / โค้ด'}
                          </div>
                          <div className="space-y-2">
                            {purchase.credentialData!.split('\n').map((cred, idx) => (
                              <div key={idx} className="bg-zinc-950 border border-emerald-900/50 text-zinc-300 px-4 py-3 rounded-xl font-mono text-xs flex-1 break-all select-all">
                                {cred}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                                <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-zinc-900 rounded-xl border border-white/5/80 shadow-sm relative overflow-hidden">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner bg-zinc-950 border border-white/5 shrink-0"
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
                                      <div className="text-xs font-bold font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md shrink-0 border border-white/10/50 shadow-sm hidden sm:block">
                                        x{drop.count}
                                      </div>
                                    )}
                                  </div>
                                  {drop.count > 1 && (
                                      <div className="absolute top-0 right-0 sm:hidden text-[10px] font-bold font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded-bl-lg shrink-0 border-b border-l border-white/10/50 ">
                                        x{drop.count}
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Contact Button for winning drops */}
                          {purchase.gachaDrops!.some(drop => !(drop as any).isSalt) && !hasCredentialData && (
                            <div className="mt-3">
                              <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => window.open(purchase.game === 'ASTD' || !purchase.game ? "https://m.me/DazzRFkaz" : "https://discord.gg/AQKtJpvyva", "_blank")}
                                className="w-full py-2 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4 text-blue-400" />
                                <span>ติดต่อรับของรางวัลทันที</span>
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
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <p className="text-zinc-400">ยังไม่มีประวัติการเติมเงิน</p>
                </div>
              ) : (
                sortedTopups.map((topup) => {
                  const { date, time } = formatDate(topup.date);
                  return (
                    <div key={topup.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg border flex-shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-zinc-100 font-bold flex items-center gap-2">
                            {topup.game && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${topup.game === 'ROV' ? 'bg-amber-500/20 text-amber-500' : topup.game === 'AOTR' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                                {topup.game}
                              </span>
                            )}
                            <span className="truncate">การเติมเงิน {topup.method}</span>
                          </p>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                            <span>อ้างอิง: {topup.refCode || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`font-mono font-bold text-right ${topup.amount > 0 ? (topup.game === 'ROV' ? 'text-amber-400' : 'text-emerald-400') : 'text-rose-400'}`}>
                        {topup.amount > 0 ? '+' : ''}{topup.amount} {topup.game === 'ROV' ? 'เครดิต' : '฿'}
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
