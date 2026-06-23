import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, PackageOpen } from 'lucide-react';
import { supabase } from '../supabase';

export interface LiveActivity {
  id: string;
  type: 'signup' | 'purchase' | 'topup';
  username: string;
  itemName?: string;
  quantity?: number;
  remainingStock?: number;
  price?: number;
  timestamp: string;
  game?: string;
  gachaDrops?: { name: string; color?: string; isSalt?: boolean }[];
}

interface LiveActivitiesProps {
  appScreen: 'ASTD' | 'AOTR' | 'ROV';
  syncCounter: number;
  isAdmin?: boolean;
}

export const LiveActivities: React.FC<LiveActivitiesProps> = ({ appScreen, syncCounter, isAdmin }) => {
  const [activities, setActivities] = useState<LiveActivity[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: raw, error } = await supabase.from('activities').select('*').order('timestamp', { ascending: false }).limit(20);
        if (raw && !error) {
          const parsed: LiveActivity[] = raw.map((d: any) => ({
            id: d.id,
            type: d.type,
            username: d.username,
            itemName: d.item_name,
            quantity: d.quantity,
            price: d.price,
            remainingStock: d.remaining_stock,
            game: d.game,
            gachaDrops: d.gacha_drops,
            timestamp: d.timestamp
          }));
          // filter by game (either undefined/legacy or matching game)
          const filtered = parsed.filter(a => {
             const timeStr = a.timestamp.endsWith('Z') || a.timestamp.includes('+') ? a.timestamp : `${a.timestamp}Z`;
             const ageHours = (Date.now() - new Date(timeStr).getTime()) / (1000 * 60 * 60);
             if (ageHours > 7) return false;
             
             // Signups go everywhere to show activity
             if (a.type === 'signup') return true;
             
             if (appScreen === 'ASTD') {
               return !a.game || a.game === 'ASTD';
             } else if (appScreen === 'AOTR') {
               return a.game === 'AOTR';
             } else {
               return a.game === 'ROV';
             }
          });
          setActivities(filtered.slice(0, 20));
        }
      } catch(e) {}
    };

    const handleSync = () => loadData();
    window.addEventListener('sync-update', handleSync);
    loadData();
    return () => window.removeEventListener('sync-update', handleSync);
  }, [appScreen, syncCounter]);

  if (activities.length === 0) {
    return (
      <div className="mb-4 sm:mb-8 mt-3 sm:mt-4 p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl bg-transparent/90 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="flex flex-col mb-2 sm:mb-5 gap-2 sm:gap-3">
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-zinc-400 font-display tracking-tight flex items-center gap-2 relative z-10">
              กิจกรรมล่าสุด
            </h2>
            <p className="text-[9px] sm:text-xs text-zinc-600 mt-1 relative z-10">กำลังรอกิจกรรมใหม่จากผู้เล่น...</p>
          </div>
        </div>
      </div>
    );
  }

  const getTimeAgo = (isoString: string) => {
    // Ensure the timestamp is treated as UTC if no timezone is specified
    const timeStr = isoString.endsWith('Z') || isoString.includes('+') ? isoString : `${isoString}Z`;
    const minDiff = Math.floor((Date.now() - new Date(timeStr).getTime()) / 60000);
    if (minDiff < 1) return 'เมื่อสักครู่';
    if (minDiff < 60) return `${minDiff} นาทีที่แล้ว`;
    return `${Math.floor(minDiff/60)} ชม. ที่แล้ว`;
  };

  return (
    <div className="mb-4 sm:mb-8 mt-3 sm:mt-4 p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl bg-transparent/90 relative overflow-hidden">
      {/* Decorative gradient accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="flex flex-row items-center justify-between mb-3 sm:mb-5 gap-2">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-white font-display tracking-tight flex items-center gap-2 relative z-10">
            กิจกรรมล่าสุด
          </h2>
          <p className="text-[9px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 relative z-10">ติดตามกิจกรรมของร้านค้าแบบเรียลไทม์</p>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border border-white/5/80 shadow-inner min-w-fit max-w-fit relative z-10">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="text-[9px] sm:text-xs font-bold text-zinc-300 whitespace-nowrap">สด</span>
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2 max-h-[140px] sm:max-h-[320px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent relative z-10">
        <AnimatePresence initial={false}>
          {activities.map((a) => {
            const hasJackpot = a.gachaDrops?.some(d => !d.isSalt);
            const luckyDrops = a.gachaDrops?.filter(d => !d.isSalt).map(d => d.name).join(', ');
            
            return (
              <motion.div 
                key={a.id}
                initial={{ opacity: 0, height: 0, scale: 0.98, y: -10 }}
                animate={{ opacity: 1, height: 'auto', scale: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-center gap-2 sm:gap-3.5 p-1.5 sm:p-3.5 rounded-lg sm:rounded-2xl border border-white/5/60 bg-black/40 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-md sm:rounded-2xl shrink-0 flex items-center justify-center border border-white/5/80 glass-panel shadow-inner">
                  {a.type === 'signup' ? (
                    <User className="w-3 h-3 sm:w-4.5 sm:h-4.5 text-zinc-400" />
                  ) : a.type === 'topup' ? (
                    <span className="text-[12px] sm:text-[18px]">💰</span>
                  ) : (
                    <PackageOpen className="w-3 h-3 sm:w-4.5 sm:h-4.5 text-zinc-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-sm font-medium text-zinc-300 font-display tracking-tight leading-tight sm:leading-relaxed break-words line-clamp-2 sm:line-clamp-none">
                    {a.type === 'signup' ? (
                      <>
                        <span className="text-zinc-400 font-bold mr-1">
                          [ระบบ]
                        </span>
                        ผู้ใช้ใหม่ <span className="text-white font-bold">{a.username}</span> เข้าร่วม
                      </>
                    ) : a.type === 'topup' ? (
                      <>
                        {a.game && (
                          <span className={`px-1 py-0.5 rounded text-[9px] font-black uppercase shrink-0 mr-1.5 ${a.game === 'ROV' ? 'bg-amber-500/20 text-amber-500' : a.game === 'AOTR' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                            {a.game}
                          </span>
                        )}
                        <span className="font-bold text-white break-all">{a.username}</span> เติมเงินสำเร็จ <span className={a.game === 'ROV' ? "text-amber-400 font-bold ml-1" : "text-emerald-400 font-bold ml-1"}>+{a.price?.toLocaleString()} {a.game === 'ROV' ? '(เครดิต)' : '฿'}</span>
                      </>
                    ) : (
                      <>
                        {a.game && (
                          <span className={`px-1 py-0.5 rounded text-[9px] font-black uppercase shrink-0 mr-1.5 ${a.game === 'ROV' ? 'bg-amber-500/20 text-amber-500' : a.game === 'AOTR' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                            {a.game}
                          </span>
                        )}
                        <span className="font-bold text-white break-all">{a.username}</span> ซื้อ <span className="text-indigo-300">[{a.itemName}]</span> <span className="text-yellow-400 font-bold font-mono ml-0.5 sm:ml-1">x{a.quantity}</span><span className="hidden sm:inline"> ชิ้น</span> {a.price && (<span className={a.game === 'ROV' ? "text-amber-400 font-bold ml-1" : "text-emerald-400 font-bold ml-1"}>({a.price.toLocaleString()} {a.game === 'ROV' ? 'เครดิต' : '฿'})</span>)}
                      </>
                    )}
                  </p>
                  
                  {/* Admin Only System: Notice if guaranteed/jackpot won */}
                  {isAdmin && a.type === 'purchase' && hasJackpot && (
                    <div className="mt-1 sm:mt-2 inline-flex items-start sm:items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded shadow-sm w-full sm:w-auto">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500 animate-ping mt-1 sm:mt-0 shrink-0"></span>
                      <span className="font-bold shrink-0">[แอดมิน]</span> 
                      <span className="font-bold break-words leading-tight">ลูกค้าคว้าของแรง: {luckyDrops}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 shrink-0">
                  <span className="text-[8px] sm:text-[10px] font-medium text-zinc-400 whitespace-nowrap glass-panel px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">{getTimeAgo(a.timestamp)}</span>
                  {(Date.now() - new Date(a.timestamp.endsWith('Z') || a.timestamp.includes('+') ? a.timestamp : `${a.timestamp}Z`).getTime()) < 3600000 && (
                    <span className="text-[7.5px] sm:text-[9px] font-bold text-white px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-zinc-800 border border-zinc-700 uppercase tracking-widest shadow-sm">
                      ใหม่
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
