import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Sparkles, MessageCircle } from 'lucide-react';

interface GachaResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    item: any;
    drops: { name: string; color?: string; isSalt?: boolean }[];
    purchaseQty?: number;
    remainingStock?: number;
    credentialData?: string[];
  } | null;
}

export const GachaResultModal: React.FC<GachaResultModalProps> = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  const allSalt = result.drops.every(d => d.isSalt);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 "
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`relative max-w-lg w-full bg-zinc-950 border-2 ${allSalt ? 'border-zinc-500/50 shadow-[0_0_50px_rgba(113,113,122,0.2)]' : 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]'} rounded-3xl p-6 z-10 text-center overflow-hidden`}
        >
          {/* Confetti / Lights effect background */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 ${allSalt ? 'bg-zinc-800' : 'bg-amber-500/20'} blur-[60px] rounded-full pointer-events-none`} />

          <motion.button whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-xl transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>

          <div className="mb-6 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 12 }}
              className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 border-zinc-950 ${allSalt ? 'bg-gradient-to-br from-zinc-500 to-zinc-700 shadow-[0_0_30px_rgba(113,113,122,0.5)]' : 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_30px_rgba(245,158,11,0.5)]'}`}
            >
              {allSalt ? (
                <div className="text-4xl">🧂</div>
              ) : (
                <Trophy className="w-12 h-12 text-white drop-shadow-md" />
              )}
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border rounded-full border-dashed pointer-events-none ${allSalt ? 'border-zinc-500/30' : 'border-amber-500/30'}`}
            />
          </div>

          <h2 className={`text-2xl font-black mb-2 font-display uppercase tracking-wider ${allSalt ? 'text-zinc-300' : 'text-white'}`}>
            {allSalt ? 'น่าเสียดาย! คุณเกลือ' : 'ยินดีด้วย! คุณได้รับ'}
          </h2>
          <p className="text-zinc-400 text-sm mb-1 max-w-sm mx-auto">
            จากการเปิด {result.item.name} จำนวน {result.purchaseQty || result.drops.length} ครั้ง
          </p>
          {result.remainingStock !== undefined ? (
            <p className="text-emerald-400 font-mono text-xs font-bold mb-6 max-w-sm mx-auto bg-emerald-500/10 py-1.5 px-4 rounded-full inline-block border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              กล่องสุ่มเหลือ {result.remainingStock} ชิ้น
            </p>
          ) : (
            <div className="mb-6" />
          )}

          <div className="space-y-3 max-h-[40dvh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            <AnimatePresence>
              {Object.values(
                result.drops.reduce((acc: any, drop) => {
                  const key = drop.name;
                  if (!acc[key]) acc[key] = { ...drop, count: 0 };
                  acc[key].count++;
                  return acc;
                }, {})
              ).sort((a: any, b: any) => {
                if (a.isSalt && !b.isSalt) return 1;
                if (!a.isSalt && b.isSalt) return -1;
                return 0;
              }).map((drop: any, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden"
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: drop.color || '#F59E0B' }}
                  />
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner bg-zinc-950"
                    style={{ color: drop.color || '#F59E0B' }}
                  >
                    {drop.isSalt ? '🧂' : '✨'}
                  </div>
                  <div className="flex-1 text-left flex justify-between items-center">
                    <div>
                      <div className={`${drop.isSalt ? 'text-zinc-400' : 'text-white'} font-bold text-lg`}>{drop.name}</div>
                      <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                        {drop.isSalt ? 'SALT / ไม่มีรางวัล' : 'Epic Drop Reward'}
                      </div>
                    </div>
                    {drop.count > 1 && (
                      <div className="text-xl font-bold font-mono text-zinc-300 bg-zinc-800 px-3 py-1 rounded-xl">
                        x{drop.count}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {result.credentialData && result.credentialData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (result.drops.length * 0.1) }}
              className="mt-6 border border-emerald-500/30 bg-emerald-900/10 rounded-2xl p-4 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px]" />
              <div className="text-sm font-bold text-emerald-400 mb-2 font-mono flex justify-between items-center relative z-10">
                <span>[{result.item?.game === 'ROV' ? 'Username:Password' : 'ข้อมูลบัญชี / โค้ด'}]</span>
                <span className="text-xs text-emerald-500/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Secret Data
                </span>
              </div>
              <div className="space-y-2 relative z-10">
                {result.credentialData.map((cred, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="bg-zinc-950 border border-white/5 text-zinc-300 px-4 py-3 rounded-xl font-mono text-xs flex-1 break-all select-all">
                      {cred}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-zinc-500 text-center font-mono relative z-10">
                โปรดก็อปปี้หรือแคปเจอร์รหัสนี้ไว้ ข้อมูลจะแสดงในประวัติการสั่งซื้อเช่นกัน
              </div>
            </motion.div>
          )}

          {!allSalt && !(result.credentialData && result.credentialData.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (result.drops.length * 0.1) }}
              className="mt-6 flex flex-col items-center"
            >
              <p className="text-zinc-400 text-xs mb-3 font-semibold">กรุณาติดต่อแอดมินพร้อมแคปหน้าจอเพื่อรับรางวัล</p>
              <a
                href={result.item?.game === 'ASTD' || !result.item?.game ? "https://m.me/DazzRFkaz" : "https://discord.gg/AQKtJpvyva"}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full py-3 px-4 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/5 hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>ติดต่อรับของรางวัลทันที</span>
              </a>
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (result.drops.length * 0.1) + 0.1 }}
            onClick={onClose}
            className={`w-full mt-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer ${
              allSalt 
                ? 'bg-zinc-800 text-zinc-300 shadow-[0_0_20px_rgba(113,113,122,0.3)]' 
                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            }`}
          >
            {allSalt ? 'ปิดหน้าต่าง' : 'ยืนยัน / เก็บเข้ากระเป๋า'}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
