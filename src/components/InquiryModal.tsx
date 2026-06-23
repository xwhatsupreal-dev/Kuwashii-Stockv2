import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ShoppingCart, ExternalLink, Send, Coins, Users } from 'lucide-react';
import { StockItem } from '../types';

interface InquiryModalProps {
  item: StockItem | null;
  onClose: () => void;
  onBuy?: (item: StockItem, qty: number) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ item, onClose, onBuy }) => {
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

  const hasPieces = item.piecesPerUnit && item.piecesPerUnit > 1;
  const unitLabel = hasPieces ? 'ชุด' : 'ชิ้น';
  const totalPiecesCount = validQuantity * (item.piecesPerUnit || 1);
  const totalItemPiecesDetail = hasPieces ? `\n• ได้รับของจริงทั้งหมด: ${totalPiecesCount} ชิ้น (${item.piecesPerUnit} ชิ้นต่อชุด)` : '';

  const totalPrice = item.price * validQuantity;

  // Generate localized order templates
  const purchaseMessage = `🛒 [สั่งซื้อ] AOT Revolution Stock
   • สินค้า: ${item.name} (${item.category} | ${item.rarity})
   • จำนวน: ${validQuantity} ${unitLabel}${hasPieces ? ` (รวม ${totalPiecesCount} ชิ้น)` : ''}
   • ราคารวม: ฿${totalPrice.toLocaleString()} บาท (${hasPieces ? 'ชุด' : 'ชิ้น'}ละ ฿${item.price.toLocaleString()} บาท)
   💬 ติดต่อแอดมิน: Kuwashii El (Discord)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(purchaseMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePurchaseButton = () => {
    const finalQuantity = Math.max(1, typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity);
    setQuantity(finalQuantity);
    if (onBuy) {
        onBuy(item, finalQuantity);
    } else {
        handleCopy();
    }
  };

  const getRarityBadgeStyle = (rarity: StockItem['rarity']) => {
    switch (rarity) {
      case 'Mythic': return 'bg-red-500/10 border-red-500/40 text-red-400';
      case 'Legendary': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Epic': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'Rare': return 'bg-blue-900/200/10 border-blue-500/30 text-blue-400';
      default: return 'bg-zinc-800 border-zinc-500/30 text-zinc-400';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Absolute Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 "
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-w-sm w-full rounded-2xl border border-white/5 bg-transparent p-4 sm:p-5 overflow-hidden shadow-2xl z-10 max-h-[90dvh] flex flex-col"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-purple-600" />

          {/* Header */}
          <div className="flex items-center justify-between mb-3 mt-1 flex-shrink-0">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <span>สรุปรายการสั่งซื้อ</span>
            </h3>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
              id="btn-close-inquiry"
            >
              <X className="w-4.5 h-4.5" />
            </motion.button>
          </div>

          {/* Scrollable Content wrapper to prevent full-screen takeover on small viewports */}
          <div className="overflow-y-auto space-y-3.5 pr-0.5 scrollbar-thin scrollbar-thumb-zinc-800 pb-1 flex-1">
            {/* Item details card preview */}
            <div className="flex gap-3 p-2.5 rounded-2xl border border-white/5 bg-zinc-900/30">
              <div className="w-14 h-14 bg-transparent border border-zinc-850 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <ShoppingCart className="w-6 h-6 text-zinc-650" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${getRarityBadgeStyle(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">{item.category}</span>
                </div>
                <h4 className="font-display font-semibold text-white text-sm leading-snug truncate">{item.name}</h4>
                <p className="font-mono text-xs font-bold text-amber-400 mt-0.5">
                  ฿{item.price.toLocaleString()} / {hasPieces ? `ชุด (${item.piecesPerUnit} ชิ้น)` : 'ชิ้น'}
                </p>
              </div>
            </div>

            {/* Dedicated full item description wrapper */}
            {item.description && (
              <div className="bg-zinc-900/20 p-3 rounded-2xl border border-white/5 text-xs leading-relaxed">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1 font-display tracking-tight">📝 คำอธิบายสินค้า / รายละเอียด:</span>
                <p className="text-zinc-200 whitespace-pre-wrap font-display tracking-tight font-medium text-[11px] leading-relaxed break-words">
                  {item.description}
                </p>
              </div>
            )}

            {/* Additional Images */}
            {item.imageUrls && item.imageUrls.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5 font-display tracking-tight">📸 รูปภาพเพิ่มเติม:</span>
                <div className="flex flex-col gap-2">
                  {item.imageUrls.map((url, idx) => (
                    <div key={idx} className="w-full rounded-lg overflow-hidden border border-zinc-850 bg-transparent">
                      <img src={url} alt={`Additional ${idx+1}`} referrerPolicy="no-referrer" className="w-full h-auto object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector Slider & Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-400 font-display tracking-tight">
                  {hasPieces ? 'จำนวนชุดที่ต้องการ:' : 'จำนวนชิ้นที่ต้องการ:'}
                </span>
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 rounded-lg p-0.5">
                  <motion.button whileTap={{ scale: 0.95 }}
                    type="button"
                    onMouseDown={() => startAutoStep('dec')}
                    onMouseUp={stopAutoStep}
                    onMouseLeave={stopAutoStep}
                    onTouchStart={() => startAutoStep('dec')}
                    onTouchEnd={stopAutoStep}
                    disabled={validQuantity <= 1}
                    className="w-7 h-7 rounded-md flex items-center justify-center font-bold font-mono text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer select-none"
                    id="btn-dec-inquiry-qty"
                  >
                    -
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
                    className="w-12 text-center text-white bg-transparent font-mono font-bold text-xs focus:outline-none focus:bg-zinc-800 rounded"
                  />

                  <motion.button whileTap={{ scale: 0.95 }}
                    type="button"
                    onMouseDown={() => startAutoStep('inc')}
                    onMouseUp={stopAutoStep}
                    onMouseLeave={stopAutoStep}
                    onTouchStart={() => startAutoStep('inc')}
                    onTouchEnd={stopAutoStep}
                    disabled={validQuantity >= item.quantity}
                    className="w-7 h-7 rounded-md flex items-center justify-center font-bold font-mono text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer select-none"
                    id="btn-inc-inquiry-qty"
                  >
                    +
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }}
                    type="button"
                    disabled={validQuantity >= item.quantity}
                    onClick={() => setQuantity(item.quantity)}
                    className="px-2 h-7 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase transition-colors hover:bg-amber-500/30 disabled:opacity-30 ml-1 select-none"
                  >
                    Max
                  </motion.button>
                </div>
              </div>

              {/* Slider control */}
              {item.quantity > 1 && (
                <div className="space-y-0.5">
                  <input
                    type="range"
                    min="1"
                    max={item.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] text-zinc-550 font-mono">
                    <span>1 {unitLabel}</span>
                    <span>สูงสุด {item.quantity} {unitLabel} {hasPieces ? `(รวม ${item.quantity * (item.piecesPerUnit || 1)} ชิ้น)` : ''}</span>
                  </div>
                </div>
              )}

              {/* Live calculation preview during purchase */}
              {hasPieces && (
                <div className="bg-zinc-900/30 px-2 py-1.5 rounded-lg border border-zinc-905 text-[10px] flex justify-between items-center text-zinc-400 leading-none">
                  <span>🎁 จะได้รับรวมเสมือนจริง:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {quantity} ชุด × {item.piecesPerUnit} = <strong className="text-white font-black text-xs">{quantity * (item.piecesPerUnit || 1)} ชิ้น</strong>
                  </span>
                </div>
              )}

              {/* Total price section */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl border border-white/5 bg-transparent">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-xs font-display tracking-tight text-zinc-450">ราคาทั้งสิ้น:</span>
                </div>
                <span className="font-mono text-base font-black text-white">
                  ฿{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {onBuy ? (
              <div className="border-t border-white/5 pt-3 mt-3">
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    handlePurchaseButton();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-[0.85rem] font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  <span>ยืนยันคำสั่งซื้อ: ฿{totalPrice.toLocaleString()}</span>
                </motion.button>
              </div>
            ) : (
              <>
                {/* Clipboard Message Copy Center */}
                <div className="space-y-1.5 mt-3">
                  <span className="text-[10px] text-zinc-450 font-display tracking-tight block">กล่องแชทข้อความสั่งซื้อด่วน:</span>
                  <div className="relative">
                    <pre className="text-[10px] font-mono leading-relaxed bg-zinc-900 border border-white/5 py-2 px-2.5 rounded-lg text-zinc-350 whitespace-pre h-16 overflow-y-auto overflow-x-hidden scrollbar">
                      {purchaseMessage}
                    </pre>
                    <div className="absolute top-1.5 right-1.5">
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={handlePurchaseButton}
                        className={`p-1.5 rounded border transition-all duration-350 cursor-pointer ${
                          copied
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-black border-white/5 text-zinc-450 hover:text-white hover:border-white/10 shadow-md'
                        }`}
                        id="btn-copy-msg"
                        title="คัดลอกข้อความ"
                      >
                        {copied ? <Check className="w-3 h-3 animate-bounce" /> : <Copy className="w-3 h-3" />}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Social connections & Action instructions */}
                <div className="border-t border-white/5 pt-3 space-y-2.5 flex-shrink-0">
                  <div className="flex items-center justify-between text-[9px] text-zinc-550 leading-none">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-600" />
                      <span>ผู้ดูแลร้าน: Kuwashii El</span>
                    </span>
                    <span>Discord: <strong className="text-[#5865F2] font-mono">Kuwashii</strong></span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      className={`py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        copied
                          ? 'bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'
                          : 'bg-zinc-900 hover:bg-zinc-150 text-black border-white shadow-md active:scale-[0.98]'
                      }`}
                      id="btn-action-copy-buy"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกคำสั่ง'}</span>
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        window.open("https://discord.gg/AQKtJpvyva", "_blank");
                      }}
                      className="py-1.5 px-3 rounded-lg font-bold text-[11px] bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#5865F2] hover:text-white border border-[#5865F2]/50 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      id="btn-join-discord"
                    >
                      <svg className="w-3 h-3 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91,65.69,84.69,65.69Z"/>
                      </svg>
                      <span>แชท Discord</span>
                    </motion.button>
                  </div>
                  <p className="text-[9px] text-zinc-600 text-center font-display tracking-tight">
                    *คัดลอกข้อความแชทแล้วทักไปแจ้งแอดมิน เพื่อส่งมอบและตัดสต๊อกของได้ทันที!
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
