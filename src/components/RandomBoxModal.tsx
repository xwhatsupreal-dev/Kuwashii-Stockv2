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
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setCopied(false);
    }
  }, [item]);

  if (!item) return null;

  const totalPrice = item.price * quantity;

  const handlePurchase = () => {
    if (onBuy) {
      onBuy(item, quantity);
    } else {
      const purchaseMessage = `🛒 [กล่องสุ่ม] ${item.game || 'ASTD'}
   • สินค้า: ${item.name}
   • จำนวน: ${quantity} กล่อง
   • ราคารวม: ฿${totalPrice.toLocaleString()} บาท
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
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Container: Dark theme with rounded corners */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-w-[340px] w-full bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[85vh] flex flex-col font-sans border border-zinc-800"
        >
          {/* Top Banner Box */}
          <div className="relative w-full h-40 bg-zinc-900 flex-shrink-0">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-amber-500 bg-gradient-to-br from-zinc-800 to-zinc-900 p-4">
                <Box className="w-14 h-14 drop-shadow-md mb-2" />
                <span className="text-white font-black text-lg drop-shadow-md uppercase">{item.game || 'MYSTERY BOX'}</span>
              </div>
            )}
            
            {/* Close button top right */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-zinc-400 hover:text-white hover:bg-black/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-5 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800 bg-zinc-950">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-1.5 flex-wrap">
              {item.name} <span className="text-lg">📦</span>
            </h2>

            {/* Description matching screenshot format */}
            <div className="text-zinc-400 text-[13px] leading-relaxed whitespace-pre-wrap mb-5 mt-3 font-medium">
              {item.description ? item.description : (
                <>
                  <p className="text-red-400">🚨 โปรดอ่านก่อนสั่งซื้อ! 🚨</p>
                  <p className="mt-1.5">💰 เมื่อลูกค้าสั่งซื้อกล่องแล้วให้ทักมาทางเพจนะครับ</p>
                  <ul className="mt-1.5 text-zinc-500">
                    <li>- มีเกลือ (โอกาสไม่ได้ของแรร์)</li>
                    <li>- ลุ้นรับของรางวัลสุดแรร์ตามที่ระบุ</li>
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
              )}
            </div>

            {/* View Gacha Pool Details */}
            {item.gachaPool && item.gachaPool.length > 0 && (
              <div className="mb-5 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2">
                  🎁 ของจำลองในกล่องสุ่มนี้ (Gacha Pool)
                </h3>
                <ul className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
                  {item.gachaPool.map((drop) => {
                    const dropColor = drop.color || '#a1a1aa';
                    const hasGuarantee = drop.guaranteedAtStock !== undefined || (drop.guaranteedAtStocks && drop.guaranteedAtStocks.length > 0);
                    return (
                      <li key={drop.id} className="text-xs flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dropColor }}></span>
                          <span className="font-medium" style={{ color: dropColor }}>{drop.name}</span>
                        </div>
                        {hasGuarantee ? (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">แรร์ไอเทม!</span>
                        ) : (
                          <span className="text-[9px] text-zinc-600">ทั่วไป</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

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
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-xl font-black text-xl hover:bg-zinc-800 hover:text-white active:scale-95 disabled:opacity-50 transition-all border border-zinc-800 cursor-pointer"
                >
                  <Minus className="w-5 h-5 stroke-[2]" />
                </button>
                
                <input 
                  type="number"
                  min={1}
                  max={item.quantity}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setQuantity(Math.min(item.quantity, Math.max(1, val)));
                  }}
                  className="flex-1 h-full text-center bg-zinc-950 border border-zinc-800 rounded-xl font-bold text-base text-white focus:outline-none focus:border-amber-500/50"
                />

                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(item.quantity, prev + 1))}
                  disabled={quantity >= item.quantity}
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-xl font-black text-xl hover:bg-zinc-800 hover:text-white active:scale-95 disabled:opacity-50 transition-all border border-zinc-800 cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[2]" />
                </button>
              </div>

              <button
                onClick={handlePurchase}
                disabled={item.quantity === 0}
                className="w-full h-11 mt-1 relative flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-bold text-sm transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                {copied ? (
                  <span className="flex items-center gap-2"><Check className="w-4 h-4 stroke-[3]" /> คัดลอกสำเร็จ!</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 stroke-[2]" /> สั่งซื้อด้วยเครดิต (Buy Data)</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
