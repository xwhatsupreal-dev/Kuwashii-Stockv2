import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Gift, Save } from 'lucide-react';

export interface CouponRecord {
  code: string;
  amount: number;
  maxUses: number;
  usedBy: string[]; // usernames of users who used it
  expiresAt?: string; // ISO date string
}

interface CouponManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CouponManagerModal: React.FC<CouponManagerModalProps> = ({ isOpen, onClose }) => {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newAmount, setNewAmount] = useState<number | string>('');
  const [newMaxUses, setNewMaxUses] = useState<number | string>(1);
  const [newExpiryDate, setNewExpiryDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('KUWASHII_COUPONS');
      if (saved) {
        setCoupons(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const handleSaveCoupons = (updatedCoupons: CouponRecord[]) => {
    setCoupons(updatedCoupons);
    localStorage.setItem('KUWASHII_COUPONS', JSON.stringify(updatedCoupons));
  };

  const handleAddCoupon = () => {
    if (!newCode.trim() || !newAmount || isNaN(Number(newAmount))) return;
    const amount = Number(newAmount);
    const maxUses = Number(newMaxUses) || 1;
    
    if (coupons.some(c => c.code.toLowerCase() === newCode.toLowerCase())) {
        alert('โค้ดนี้มีอยู่แล้วในระบบ');
        return;
    }

    const updated = [
      ...coupons,
      { code: newCode.trim(), amount, maxUses, usedBy: [], expiresAt: newExpiryDate || undefined }
    ];
    handleSaveCoupons(updated);
    setNewCode('');
    setNewAmount('');
    setNewMaxUses(1);
    setNewExpiryDate('');
  };

  const handleDelete = (code: string) => {
    if (confirm(`ต้องการลบโค้ด ${code} หรือไม่?`)) {
      handleSaveCoupons(coupons.filter(c => c.code !== code));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 "
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative max-w-2xl w-full bg-zinc-900 rounded-2xl flex flex-col font-sans border border-white/10 h-[80dvh] shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 shrink-0">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-500" />
              จัดการโค้ดคูปอง (เครดิตฟรี)
            </h2>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-6">
            <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">สร้างคูปองใหม่</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="ชื่อโค้ด"
                  className="bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="เครดิตที่จะได้"
                  className="bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  placeholder="จำนวนคนที่รีดีมได้"
                  className="bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 text-zinc-400"
                  title="เวลาหมดอายุ (Optional)"
                />
              </div>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={handleAddCoupon}
                disabled={!newCode.trim() || !newAmount}
                className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> เพิ่มคูปอง
              </motion.button>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">โค้ดในระบบ</h3>
              <div className="space-y-2">
                {coupons.length === 0 ? (
                  <div className="text-center p-8 text-zinc-500 text-sm">ไม่มีคูปองในระบบ</div>
                ) : (
                  coupons.map(c => {
                    const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                    return (
                      <div key={c.code} className="flex items-center justify-between p-3 rounded-xl border border-white/5/80 bg-zinc-950">
                        <div>
                          <div className={`font-bold font-mono text-sm ${isExpired ? 'text-zinc-500 line-through' : 'text-emerald-400'}`}>
                            {c.code} {isExpired && <span className="text-xs text-red-500 font-sans font-bold no-underline ml-2">(หมดอายุ)</span>}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">
                            ได้รับ: {c.amount.toLocaleString()} เครดิต • ใช้งานแล้ว {c.usedBy.length}/{c.maxUses} คน
                            {c.expiresAt && (
                              <span className="block mt-0.5 text-zinc-500/80">หมดอายุ: {new Date(c.expiresAt).toLocaleDateString('th-TH')}</span>
                            )}
                          </div>
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(c.code)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};
