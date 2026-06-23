import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Edit2, Trash2, Plus, Package } from 'lucide-react';
import { StockItem } from '../types';

interface StockManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const StockManagerModal: React.FC<StockManagerModalProps> = ({
  isOpen,
  onClose,
  items,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const searchStr = (searchTerm || '').toLowerCase();
  const filteredItems = items.filter(item => 
    (item.name || '').toLowerCase().includes(searchStr) || 
    (item.category || '').toLowerCase().includes(searchStr)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Cover */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 "
        />

        {/* Modal Container */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-5xl h-[85dvh] rounded-2xl border border-white/5 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">ระบบผู้ดูแลสต๊อก</h3>
                <p className="text-xs text-zinc-500 font-sans mt-0.5">จัดการสินค้าคงคลังทั้งหมด</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.95 }} 
                onClick={onAddNew}
                className="bg-zinc-900 text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> เพิ่มสินค้าใหม่
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="flex-shrink-0 p-5 bg-zinc-900 border-b border-zinc-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อสินค้า หมวดหมู่..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-600 font-sans"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-zinc-900">
            <table className="w-full text-left font-sans text-sm">
                <thead className="bg-zinc-950 sticky top-0 border-b border-zinc-900  z-10">
                    <tr>
                        <th className="px-5 py-4 font-bold text-zinc-400 uppercase tracking-wider text-xs">สินค้า</th>
                        <th className="px-5 py-4 font-bold text-zinc-400 uppercase tracking-wider text-xs">เกม</th>
                        <th className="px-5 py-4 font-bold text-zinc-400 uppercase tracking-wider text-xs">หมวดหมู่</th>
                        <th className="px-5 py-4 font-bold text-zinc-400 uppercase tracking-wider text-xs text-right">จำนวนสต๊อก</th>
                        <th className="px-5 py-4 font-bold text-zinc-400 uppercase tracking-wider text-xs text-right">ราคา (฿)</th>
                        <th className="px-5 py-4 font-bold text-zinc-400 uppercase tracking-wider text-xs text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                    {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-zinc-900 transition-colors group">
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                   {item.imageUrl ? (
                                     <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
                                       <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                     </div>
                                   ) : (
                                     <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0 text-zinc-600">
                                       <Package className="w-4 h-4" />
                                     </div>
                                   )}
                                   <div className="font-bold text-white line-clamp-1">{item.name}</div>
                                </div>
                            </td>
                            <td className="px-5 py-3 text-zinc-300 font-bold">{item.game}</td>
                            <td className="px-5 py-3">
                                <span className="px-2.5 py-1 rounded-lg border border-white/5 bg-zinc-900 text-xs text-zinc-400 font-medium">
                                    {item.category}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                                <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${item.quantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                                    {item.quantity}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-right text-amber-500 font-mono font-bold">
                                {item.price.toLocaleString()}
                            </td>
                            <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button whileTap={{ scale: 0.95 }} 
                                      onClick={() => onEdit(item)}
                                      className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors cursor-pointer"
                                      title="แก้ไข"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} 
                                      onClick={() => {
                                        if(window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) onDelete(item.id);
                                      }}
                                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                                      title="ลบ"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredItems.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 font-medium">
                                ไม่พบข้อมูลสินค้าที่ค้นหา
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
