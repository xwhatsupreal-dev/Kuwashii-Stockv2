import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ShoppingCart, Minus, Plus, Box } from 'lucide-react';
import { StockItem } from '../types';

interface RandomBoxModalProps {
  item: StockItem | null;
  onClose: () => void;
  onBuy?: (item: StockItem, quantity: number) => void;
}

export const RandomBoxModal: React.FC<RandomBoxModalProps> = ({ item, onClose, onBuy }) => {
  const [quantity, setQuantity] = useState<number | string>(1);
  const [copied, setCopied] = useState(false);
  const pressTimeout = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setCopied(false);
    }
  }, [item]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (pressTimeout.current) clearTimeout(pressTimeout.current);
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  if (!item) return null;

  const validQuantity = typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity;
  const totalPrice = item.price * validQuantity;

  const handleStep = (type: 'inc' | 'dec') => {
    setQuantity(prev => {
      let current = typeof prev === 'string' ? parseInt(prev) : prev;
      if (isNaN(current)) current = 1;
      if (type === 'inc') return Math.min(item.quantity, current + 1);
      if (type === 'dec') return Math.max(1, current - 1);
      return current;
    });
  };

  const startAutoStep = (type: 'inc' | 'dec') => {
    handleStep(type);
    let speed = 250;
    const nextTick = () => {
      pressTimeout.current = setTimeout(() => {
        setQuantity(prev => {
          let current = typeof prev === 'string' ? parseInt(prev) : prev;
          if (isNaN(current)) current = 1;
          if (type === 'inc' && current >= item.quantity) {
             if (pressTimeout.current) clearTimeout(pressTimeout.current);
             return current;
          }
          if (type === 'dec' && current <= 1) {
             if (pressTimeout.current) clearTimeout(pressTimeout.current);
             return current;
          }
          
          const nextVal = type === 'inc' ? Math.min(item.quantity, current + 1) : Math.max(1, current - 1);
          return nextVal;
        });
        speed = Math.max(30, speed * 0.85); // Accelerate
        nextTick();
      }, speed);
    };
    
    pressTimeout.current = setTimeout(() => {
        nextTick();
    }, 400); // initial delay before repeat
  };

  const stopAutoStep = () => {
    if (pressTimeout.current) clearTimeout(pressTimeout.current);
  };

  const handlePurchase = () => {
    const finalQuantity = Math.max(1, typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity);
    setQuantity(finalQuantity); // Auto lock-in
    
    if (onBuy) {
      onBuy(item, finalQuantity);
    } else {
      const purchaseMessage = `🛒 [กล่องสุ่ม] ${item.game || 'ASTD'}
   • สินค้า: ${item.name}
   • จำนวน: ${finalQuantity} กล่อง
   • ราคารวม: ฿${(item.price * finalQuantity).toLocaleString()} บาท
   💬 โปรดสุ่มและแจ้งมอบรางวัล (ติดต่อแอดมิน)`;
      navigator.clipboard.writeText(purchaseMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop overlay - using a slightly warmer blur to match screenshot vibe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 "
        />

        {/* Modal Container: Dark theme with rounded corners */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-w-[340px] w-full bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[85dvh] flex flex-col font-sans border border-white/5"
        >
          {/* Close button top right */}
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-zinc-900 border border-white/5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer z-50"
          >
            <X className="w-4 h-4" />
          </motion.button>

          <div className="p-4 sm:p-5 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800 bg-zinc-950 pt-10">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-1.5 flex-wrap">
              {item.name} <span className="text-lg">📦</span>
            </h2>

            {/* Description matching screenshot format */}
            <div className="text-zinc-400 text-[13px] leading-relaxed whitespace-pre-wrap mb-5 mt-3 font-medium">
              {item.description /* custom description here */}
              {item.description && <div className="h-px bg-zinc-800 my-3" />}

              {/* Additional Images */}
              {item.imageUrls && item.imageUrls.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5 font-sans">📸 รูปภาพเพิ่มเติม:</span>
                  <div className="flex flex-col gap-2">
                    {item.imageUrls.map((url, idx) => (
                      <div key={idx} className="w-full rounded-lg overflow-hidden border border-zinc-850 bg-zinc-950">
                        <img src={url} alt={`Additional ${idx+1}`} referrerPolicy="no-referrer" className="w-full h-auto object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <>
                <p className="text-red-400">🚨 โปรดอ่านก่อนสั่งซื้อ! 🚨</p>
                <p className="mt-1.5">💰 เมื่อได้ตัวละคร ให้ทักแอดมินตามช่องทางที่กำหนดเพื่อรับของรางวัล</p>
                <ul className="mt-1.5 text-zinc-500 space-y-1">
                  <li>- มีเกลือ (โอกาสไม่ได้ของแรร์)</li>
                  <li>- ลุ้นรับของรางวัล (มีโอกาสได้รับของรางวัลสุดแรร์ ✨)</li>
                </ul>
                <p className="mt-3 text-amber-400 font-bold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-xs">
                  ⚠️ แค่กดสั่งซื้อ ระบบจะสุ่มรางวัลให้ทันที
                </p>
                <p className="mt-2 text-red-500 font-bold text-xs">
                  ‼️ หากลูกค้าได้รับชื่อตัวละครที่ได้จากการสุ่ม ให้เเคปส่งให้เจ้าของสินค้าได้เลย
                </p>
                <p className="mt-2 text-emerald-400 font-bold text-[11px] flex items-start gap-1">
                  <span className="text-sm">✅</span> เมื่อได้ข้อความ ทักแอดมินทางเพจเพื่อรับของรางวัล
                </p>
              </>
            </div>


            {/* Purchase area */}
            <div className="mt-2 flex flex-col gap-4">
              <div className="flex items-center justify-between font-bold text-base">
                 <div className="text-zinc-300">
                    ราคา : <span className="text-amber-500">{item.price.toLocaleString()}.00 บาท</span>
                 </div>
                 <div className="text-zinc-500 font-medium text-xs">
                    เหลือ <span className="text-amber-500 font-bold">{item.quantity.toLocaleString()}</span> ชิ้น
                 </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-2 h-11 w-full">
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onMouseDown={() => startAutoStep('dec')}
                  onMouseUp={stopAutoStep}
                  onMouseLeave={stopAutoStep}
                  onTouchStart={() => startAutoStep('dec')}
                  onTouchEnd={stopAutoStep}
                  disabled={validQuantity <= 1}
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-xl font-black text-xl hover:bg-zinc-800 hover:text-white active:scale-95 disabled:opacity-50 transition-all border border-white/5 cursor-pointer select-none"
                >
                  <Minus className="w-5 h-5 stroke-[2]" />
                </motion.button>
                
                <input 
                  type="number"
                  min={1}
                  max={item.quantity}
                  value={quantity}
                  onBlur={() => {
                    let current = typeof quantity === 'string' ? parseInt(quantity) : quantity;
                    if (isNaN(current) || current < 1) current = 1;
                    if (current > item.quantity) current = item.quantity;
                    setQuantity(current);
                  }}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    if (valStr === '') {
                        setQuantity('');
                    } else {
                        const val = parseInt(valStr);
                        if (!isNaN(val)) {
                            setQuantity(Math.min(item.quantity, val));
                        }
                    }
                  }}
                  className="flex-1 h-full text-center bg-zinc-950 border border-white/5 rounded-xl font-bold text-base text-white focus:outline-none focus:border-amber-500/50"
                />

                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onMouseDown={() => startAutoStep('inc')}
                  onMouseUp={stopAutoStep}
                  onMouseLeave={stopAutoStep}
                  onTouchStart={() => startAutoStep('inc')}
                  onTouchEnd={stopAutoStep}
                  disabled={validQuantity >= item.quantity}
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-xl font-black text-xl hover:bg-zinc-800 hover:text-white active:scale-95 disabled:opacity-50 transition-all border border-white/5 cursor-pointer select-none"
                >
                  <Plus className="w-5 h-5 stroke-[2]" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  disabled={validQuantity >= item.quantity}
                  onClick={() => setQuantity(item.quantity)}
                  className="px-3 h-11 rounded-xl bg-amber-500/20 text-amber-500 text-xs font-bold uppercase transition-colors hover:bg-amber-500/30 disabled:opacity-30 border border-amber-500/10 active:scale-95 cursor-pointer ml-1 select-none"
                >
                  Max
                </motion.button>
              </div>

              <motion.button whileTap={{ scale: 0.95 }}
                onClick={handlePurchase}
                disabled={item.quantity === 0}
                className="w-full h-11 mt-1 relative flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-bold text-sm transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                {copied ? (
                  <span className="flex items-center gap-2"><Check className="w-4 h-4 stroke-[3]" /> คัดลอกสำเร็จ!</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 stroke-[2]" /> สั่งซื้อกล่องสุ่มด้วยเครดิต</span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
