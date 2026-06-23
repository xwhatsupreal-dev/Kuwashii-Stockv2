import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, ShieldAlert, BadgeInfo, Coins, Package, Clock, ShoppingBag, Pin, Flame, Sparkles } from 'lucide-react';
import { StockItem } from '../types';

interface ItemCardProps {
  item: StockItem;
  isAdmin: boolean;
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onQuickQuantityChange: (id: string, delta: number) => void;
  onInquire: (item: StockItem) => void;
  onBuy?: (item: StockItem, qty: number) => void;
  onTogglePin: (id: string) => void;
  appScreen?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isAdmin,
  onEdit,
  onDelete,
  onQuickQuantityChange,
  onInquire,
  onBuy,
  onTogglePin,
  appScreen,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const getFormatColors = (format?: string) => {
    switch (format) {
      case 'กล่องสุ่ม':
        return {
          bg: 'bg-purple-500/10 border-purple-500/40 text-purple-600',
          badge: 'bg-purple-500 text-zinc-100 shadow-purple-500/50',
          glow: 'epic-glow',
          text: 'text-purple-600',
          border: 'border-purple-500/30 hover:border-purple-500/80',
          gradient: 'from-purple-500/20 via-transparent to-transparent'
        };
      case 'ขายรหัส':
      default:
        return {
          bg: 'bg-blue-900/200/10 border-blue-500/40 text-blue-600',
          badge: 'bg-blue-900/200 text-zinc-100 shadow-blue-500/50',
          glow: 'rare-glow',
          text: 'text-blue-600',
          border: 'border-blue-500/30 hover:border-blue-500/80',
          gradient: 'from-blue-500/20 via-transparent to-transparent'
        };
    }
  };

  const colors = getFormatColors(item.saleFormat);

  // Status computation
  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: 'สินค้าหมด', color: 'bg-red-500 text-red-400 border-red-500/20' };
    if (qty <= 5) return { label: 'ใกล้หมด', color: 'bg-amber-500 text-amber-400 border-amber-500/20' };
    return { label: 'มีสินค้า', color: 'bg-emerald-500 text-emerald-400 border-emerald-500/20' };
  };

  const status = getStockStatus(item.quantity);

  const getRelativeTimeString = (dateString?: string): string => {
    if (!dateString) return 'ไม่มีการบันทึกข้อมูล';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'ไม่มีการบันทึกข้อมูล';
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 15) return 'เมื่อสักครู่นี้';
      if (diffSec < 60) return 'เมื่อไม่กี่วินาทีก่อน';
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
      if (diffDays === 1) return 'เมื่อวานนี้';
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      });
    } catch (e) {
      return 'ไม่มีการบันทึกข้อมูล';
    }
  };

  let formattedDate = 'ไม่มีการบันทึกข้อมูล';
  if (item.updatedAt) {
    const rawDate = new Date(item.updatedAt);
    if (!isNaN(rawDate.getTime())) {
      formattedDate = rawDate.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  const relativeTime = getRelativeTimeString(item.updatedAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-zinc-800 transition-all duration-300 ${colors.border} ${colors.glow}`}
      id={`item-card-${item.id}`}
    >
      {/* Background radial gradient representing rarity */}
      <div className={`absolute top-0 left-0 right-0 aspect-square bg-gradient-to-b ${colors.gradient} -z-10`} />

      {/* Top Banner & Badges */}
      <div className="p-3 sm:p-4 pb-1.5 sm:pb-2">
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          {/* Category & Pin Badge Group */}
          <div className="flex items-center gap-1.5">
            {isAdmin ? (
              <motion.button whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onTogglePin(item.id)}
                className={`p-1.5 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-center ${
                  item.isPinned
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-550 hover:text-zinc-400 hover:border-zinc-700'
                }`}
                title={item.isPinned ? 'เลิกปักหมุดสินค้านี้' : 'ปักหมุดสินค้านี้'}
              >
                <Pin className={`w-3.5 h-3.5 transition-transform ${item.isPinned ? 'fill-current scale-110 text-amber-400' : 'text-zinc-500 rotate-45'}`} />
              </motion.button>
            ) : item.isPinned ? (
              <div
                className="p-1.5 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-400 flex items-center justify-center cursor-default"
                title="สินค้านี้ถูกปักหมุดโดยแอดมิน"
              >
                <Pin className="w-3.5 h-3.5 fill-current text-amber-400" />
              </div>
            ) : null}
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-zinc-900 text-zinc-500 border border-zinc-700/60">
              {item.category}
            </span>
          </div>

          {/* Sale Format Badge */}
          {item.saleFormat && (
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1 ${colors.bg}`}>
              <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
              {item.saleFormat}
            </span>
          )}
        </div>

        {/* Item Image with hover expansion */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-3 flex items-center justify-center group/carousel">
          {(item.imageUrls && item.imageUrls.length > 0) || item.imageUrl ? (
            <>
              <img
                src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[currentImageIndex] : item.imageUrl!}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                }}
              />
              {item.imageUrls && item.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? item.imageUrls!.length - 1 : prev - 1); }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 text-zinc-100 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                  >
                    &lsaquo;
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === item.imageUrls!.length - 1 ? 0 : prev + 1); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 text-zinc-100 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                  >
                    &rsaquo;
                  </button>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                    {item.imageUrls.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImageIndex ? 'bg-zinc-900' : 'bg-zinc-900'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-700/50 mb-2 text-zinc-500 group-hover:border-zinc-600 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">AOT Revolution</span>
            </div>
          )}

          {/* Absolute overlay price tag */}
          <div className="absolute bottom-2 right-2 bg-zinc-900  px-2.5 py-1 rounded-lg border border-zinc-800/80 flex items-center gap-1">
            <Coins className="w-3 h-3 text-yellow-500" />
            <span className="font-mono text-xs font-bold text-zinc-100">฿{item.price.toLocaleString()}</span>
          </div>

          {/* Stock Availability indicator */}
          <div className="absolute top-2 left-2 bg-zinc-900  px-2 py-0.5 rounded-md border border-zinc-800/60 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${status.color.split(' ')[0]}`} />
            <span className="text-[9px] tracking-wide font-medium text-zinc-400">{status.label}</span>
          </div>

          {/* Popular Tag */}
          {item.isPopular && (
            <div className="absolute top-2 right-2 bg-rose-500/90 text-zinc-100 font-bold  px-2 py-0.5 rounded-md border border-rose-450/40 flex items-center gap-1 shadow-md shadow-rose-500/20">
              <Flame className="w-3 h-3 fill-current text-zinc-100 animate-pulse" />
              <span className="text-[9px] tracking-wide">ยอดนิยม</span>
            </div>
          )}
        </div>

        {/* Typography */}
        <h3 className="font-display text-[15px] font-bold tracking-tight text-zinc-100 tracking-tight mb-1 group-hover:text-amber-400 transition-colors flex items-center gap-1">
          {item.isPinned && <Pin className="w-3 h-3 text-amber-400 fill-current flex-shrink-0 animate-bounce" />}
          <span className="truncate">{item.name}</span>
        </h3>

        {/* Description */}
        <p className="text-[11px] text-zinc-500 line-clamp-2 min-h-[1.75rem] leading-relaxed mb-3 font-display tracking-tight">
          {item.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับไอเทมนี้'}
        </p>

        {/* Info Grid */}
        {(() => {
          const initQty = item.initialQuantity && item.initialQuantity >= item.quantity ? item.initialQuantity : item.quantity;
          const percentage = initQty > 0 ? (item.quantity / initQty) * 100 : 0;
          const hasPieces = item.piecesPerUnit && item.piecesPerUnit > 1;

          if (hasPieces) {
            const pUnit = item.piecesPerUnit as number;
            return (
              <div className="space-y-2 bg-zinc-900 shadow-sm border border-zinc-800  p-2.5 rounded-2xl border border-zinc-800 text-[11px] font-display tracking-tight">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Package className="w-3.5 h-3.5 text-zinc-500" />
                    <span>สต๊อกคลังสินค้า:</span>
                  </div>
                  <div className="text-right font-mono font-bold text-zinc-100">
                    {item.quantity === 0 ? (
                      <span className="text-red-400 font-extrabold text-xs">หมดคลัง</span>
                    ) : item.initialQuantity && item.initialQuantity > item.quantity ? (
                      <span className="text-zinc-400">
                        <span className="text-emerald-450 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{item.quantity}</span>
                        <span className="text-zinc-500 font-normal mx-0.5">/</span>
                        <span className="text-zinc-500">{item.initialQuantity}</span> ชุด
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{item.quantity} ชุด</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/45 pt-1.5 mt-1">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>จำนวนของที่จะได้:</span>
                  </div>
                  <div className="text-right font-mono font-extrabold text-amber-400 text-xs">
                    {pUnit} <span className="text-[9px] font-normal text-zinc-500">ชิ้นต่อชุด</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/45 pt-1.5 mt-1 bg-transparent/20 -mx-1 px-1 rounded-md">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Coins className="w-3.5 h-3.5 text-emerald-500" />
                    <span>รวมของทั้งหมดมี:</span>
                  </div>
                  <div className="text-right font-mono font-extrabold text-zinc-300">
                    <span className="text-zinc-100 text-xs font-black">{item.quantity * pUnit}</span> ชิ้น
                  </div>
                </div>

                {/* Progress bar visual */}
                {initQty > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-zinc-800/45">
                    <div className="w-full bg-transparent h-1.5 rounded-full overflow-hidden p-0.5 flex items-center border border-zinc-800/30">
                      <div 
                        className={`h-0.5 rounded-full transition-all duration-500 ${
                          item.quantity === 0
                            ? 'w-0'
                            : item.quantity <= 1
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-zinc-500 font-medium leading-none">
                      <span>สถานะคลังสินค้า</span>
                      <span className="font-mono font-bold text-zinc-500">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-2 bg-zinc-900 shadow-sm border border-zinc-800  p-2.5 rounded-2xl border border-zinc-800 text-[11px] font-display tracking-tight">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Package className="w-3.5 h-3.5 text-zinc-500" />
                  <span>สต๊อกคงเหลือ:</span>
                </div>
                <div className="text-right font-mono font-bold text-zinc-100">
                  {item.quantity === 0 ? (
                    <span className="text-red-400 font-extrabold">หมดเกลี้ยง</span>
                  ) : item.initialQuantity && item.initialQuantity > item.quantity ? (
                    <span className="text-zinc-400">
                      <span className="text-emerald-400 font-bold">{item.quantity}</span>
                      <span className="text-zinc-500 font-normal mx-0.5">/</span>
                      <span className="text-zinc-500">{item.initialQuantity}</span> ชิ้น
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">{item.quantity} ชิ้น</span>
                  )}
                </div>
              </div>
              
              {/* Progress bar visual */}
              {initQty > 0 && (
                <div className="space-y-1 pt-0.5">
                  <div className="w-full bg-transparent h-1.5 rounded-full overflow-hidden p-0.5 flex items-center border border-zinc-800/30">
                    <div 
                      className={`h-0.5 rounded-full transition-all duration-500 ${
                        item.quantity === 0
                          ? 'w-0'
                          : item.quantity <= 5
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-500 font-medium">
                    <span>สถานะคลังสินค้า</span>
                    <span className="font-mono font-bold text-zinc-500">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Bottom Action Section */}
      <div className="p-3 sm:p-4 pt-0 bg-zinc-900">
        {/* Admin actions or regular users Inquiry action */}
        {isAdmin ? (
          <div className="mt-1 border-t border-zinc-800 pt-3 flex flex-col gap-2.5">
            {/* Quick stock adjustment controls */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">สต๊อก:</span>
              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onQuickQuantityChange(item.id, -1)}
                  disabled={item.quantity <= 0}
                  className="w-6 h-6 flex items-center justify-center rounded text-zinc-450 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-xs font-bold font-mono cursor-pointer"
                  id={`btn-add-dec-${item.id}`}
                >
                  -
                </motion.button>
                <span className="w-6 text-center font-mono font-bold text-xs text-zinc-100">
                  {item.quantity}
                </span>
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onQuickQuantityChange(item.id, 1)}
                  className="w-6 h-6 flex items-center justify-center rounded text-zinc-455 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-xs font-bold font-mono cursor-pointer"
                  id={`btn-add-inc-${item.id}`}
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Core admin actions: Edit & Delete */}
            <div className="grid grid-cols-2 gap-2">
              <motion.button whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onEdit(item)}
                className="py-1 px-2 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-805 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                id={`btn-admin-edit-${item.id}`}
              >
                <Edit2 className="w-3 h-3" />
                <span>แก้ไข</span>
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onDelete(item.id)}
                className="py-1 px-2 rounded-lg border border-red-950/40 hover:border-red-600/50 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                id={`btn-admin-del-${item.id}`}
              >
                <Trash2 className="w-3 h-3" />
                <span>ลบออก</span>
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5">
            <motion.button whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                onInquire(item);
              }}
              disabled={item.quantity === 0}
              className={`w-full py-2 px-3 rounded-2xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border ${
                item.quantity === 0
                  ? 'bg-zinc-900 shadow-sm border border-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed'
                  : onBuy 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-100 border-emerald-500 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-[0.98]'
                    : 'bg-zinc-900 hover:bg-zinc-100 text-black border-white shadow-md cursor-pointer active:scale-[0.98]'
              }`}
              id={`btn-buy-${item.id}`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{item.quantity === 0 ? 'สินค้าหมดคลัง' : (item.gachaPool && item.gachaPool.length > 0 && onBuy ? 'สั่งซื้อกล่องสุ่ม' : (onBuy ? 'ซื้อด้วยเครดิต / ระบุจำนวน' : 'สนใจซื้อ / สอบถามสต๊อก'))}</span>
            </motion.button>
          </div>
        )}

        {/* Timestamp footer in monospace */}
        <div className="mt-2.5 flex items-center justify-between text-[9px] text-zinc-600 border-t border-zinc-800 pt-2 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-zinc-300" />
            <span className="text-zinc-500 font-display tracking-tight" title={formattedDate}>{relativeTime}</span>
          </span>
          <span className="text-zinc-700">ID: {item.id.slice(0, 6)}</span>
        </div>
      </div>
    </motion.div>
  );
};
