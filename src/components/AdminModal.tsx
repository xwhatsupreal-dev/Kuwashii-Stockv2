import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload, Link, AlertCircle, Sparkles, Image as ImageIcon, Package, Coins, Clock, Plus, Trash2 } from 'lucide-react';
import { StockItem } from '../types';
import { supabase } from '../supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<StockItem, 'updatedAt'>) => void;
  editingItem: StockItem | null;
  currentGame: 'AOTR' | 'ASTD';
}

const PRESET_IMAGE_SUGGESTIONS = [
  { name: 'Serum - Red', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' },
  { name: 'Bloodline - Yellow', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80' },
  { name: 'Ancient Scroll', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&q=80' },
  { name: 'Titan Core', url: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=400&q=80' },
  { name: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80' },
  { name: 'Abyss Deep Blue', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80' },
];

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  currentGame,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Grow A Garden 2');
  const [saleFormat, setSaleFormat] = useState<'ขายรหัส' | 'กล่องสุ่ม'>('ขายรหัส');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [initialQuantity, setInitialQuantity] = useState<number | string>('');
  const [piecesPerUnit, setPiecesPerUnit] = useState<number | string>('');
  const [price, setPrice] = useState<number | string>(10);
  const [description, setDescription] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [gachaPool, setGachaPool] = useState<{ id: string; name: string; color?: string; guaranteedAtStock?: number; guaranteedAtStocks?: number[]; }[]>([]);
  const [accountCredentialsText, setAccountCredentialsText] = useState('');
  const [claimedJackpots, setClaimedJackpots] = useState<any[]>([]);
  
  const [imageType, setImageType] = useState<'url' | 'upload' | 'presets'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlsText, setImageUrlsText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category || 'Grow A Garden 2');
      setSaleFormat(editingItem.saleFormat || 'ขายรหัส');
      setQuantity(editingItem.quantity);
      setInitialQuantity(editingItem.initialQuantity !== undefined ? editingItem.initialQuantity : editingItem.quantity);
      setPiecesPerUnit(editingItem.piecesPerUnit !== undefined ? editingItem.piecesPerUnit : '');
      setPrice(editingItem.price);
      setDescription(editingItem.description);
      setIsPinned(!!editingItem.isPinned);
      setIsPopular(!!editingItem.isPopular);
      setGachaPool(editingItem.gachaPool || []);
      setAccountCredentialsText(editingItem.accountCredentials ? editingItem.accountCredentials.join('\n') : '');
      
      const fetchClaims = async () => {
        if (editingItem.category === 'สุ่มตัวละคร - ออสตา' || (editingItem.gachaPool && editingItem.gachaPool.length > 0)) {
          const { data } = await supabase.from('claimed_jackpots').select('*').eq('item_id', editingItem.id);
          if (data) setClaimedJackpots(data);
        }
      };
      fetchClaims();

      let base64Imgs: string[] = [];
      let normalUrls: string[] = [];
      
      const allImgs = editingItem.imageUrls ? [...editingItem.imageUrls] : (editingItem.imageUrl ? [editingItem.imageUrl] : []);
      allImgs.forEach(img => {
        if (img.startsWith('data:image/')) {
          base64Imgs.push(img);
        } else {
          normalUrls.push(img);
        }
      });
      
      setImageUrlsText(normalUrls.join('\n'));
      
      if (base64Imgs.length > 0) {
        setImageType('upload');
        setUploadedImages(base64Imgs);
        setImageUrl('');
      } else {
        setImageType('url');
        setImageUrl(normalUrls.length > 0 ? normalUrls[0] : '');
        setUploadedImages([]);
      }
    } else {
      // Clear values for new item
      setName('');
      setCategory('Grow A Garden 2');
      setSaleFormat('ขายรหัส');
      setQuantity(1);
      setInitialQuantity('');
      setPiecesPerUnit('');
      setPrice(10);
      setDescription('');
      setIsPinned(false);
      setIsPopular(false);
      setGachaPool([]);
      setClaimedJackpots([]);
      setImageType('url');
      setImageUrl('');
      setUploadedImages([]);
      setImageUrlsText('');
    }
    setErrors({});
  }, [editingItem, isOpen, currentGame]);

  if (!isOpen) return null;

  // Converts native file selection to Base64 and resizes to save space
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาอัปโหลดรูปภาพเท่านั้น!');
      return;
    }
    if (file.size > 1024 * 1024 * 5) {
      alert('รูปภาพมีขนาดใหญ่เกินไป (เกิน 5MB) กรุณาใช้รูปลิงก์ URL รูปภาพแทนช่องทางนี้เพื่อประสิทธิภาพสูงสุด');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Create an image object
        const img = new Image();
        img.onload = () => {
          // Max dimension 800px
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress to 60% quality jpeg
            setUploadedImages(prev => [...prev, dataUrl]);
            setImageType('upload');
          } else {
            setUploadedImages(prev => [...prev, e.target!.result as string]);
            setImageType('upload');
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => processFile(file));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => processFile(file));
    }
  };

  const handlePresetSelect = (url: string) => {
    setImageUrl(url);
    setImageType('url');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const qty = typeof quantity === 'number' ? quantity : parseInt(quantity as string, 10);
    const p = typeof price === 'number' ? price : parseInt(price as string, 10);
    if (!name.trim()) newErrors.name = 'กรุณากรอกชื่อไอเทม';
    if (isNaN(qty) || qty < 0) newErrors.quantity = 'จำนวนสินค้าจะต้องไม่ติดลบ';
    if (isNaN(p) || p < 0) newErrors.price = 'ราคาจำเป็นจะต้องมากกว่าหรือเท่ากับ 0 บาท';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const urlImgs = imageUrlsText.trim().split('\n').map(c => c.trim()).filter(c => c.length > 0);
    
    let allImages: string[] = [];
    if (imageType === 'url') {
      if (imageUrl.trim()) allImages.push(imageUrl.trim());
      allImages = [...allImages, ...urlImgs, ...uploadedImages]; 
    } else if (imageType === 'upload') {
      allImages = [...uploadedImages, ...urlImgs];
      if (imageUrl.trim() && !allImages.includes(imageUrl.trim())) allImages.push(imageUrl.trim());
    }

    // fallback mapping string list
    let finalImageUrl = allImages.length > 0 ? allImages[0] : '';
    let addImgs = allImages;

    const currentQty = typeof quantity === 'number' ? quantity : (parseInt(quantity as string, 10) || 0);
    const currentPrice = typeof price === 'number' ? price : (parseInt(price as string, 10) || 0);
    const initQty = typeof initialQuantity === 'number' ? initialQuantity : parseInt(initialQuantity as string, 10);
    const finalInitialQuantity = (!isNaN(initQty) && initQty >= currentQty) ? initQty : currentQty;

    const pPerUnit = typeof piecesPerUnit === 'number' ? piecesPerUnit : parseInt(piecesPerUnit as string, 10);
    const finalPiecesPerUnit = (!isNaN(pPerUnit) && pPerUnit > 0) ? pPerUnit : undefined;

    const accCreds = accountCredentialsText.trim().split('\n').map(c => c.trim()).filter(c => c.length > 0);
    let finalQty = currentQty;
    let finalInitQty = finalInitialQuantity;

    if (category === 'Starter Accounts' || category === 'รหัส ROV' || category === 'ไอดี ROV') {
      if (accCreds.length > 0) {
        finalQty = accCreds.length;
        if (!editingItem || !editingItem.initialQuantity) finalInitQty = accCreds.length;
      }
    }

    onSave({
      id: editingItem ? editingItem.id : `${currentGame.toLowerCase()}-${Date.now()}`,
      game: currentGame,
      name: name.trim(),
      category,
      saleFormat,
      quantity: finalQty,
      initialQuantity: finalInitQty,
      piecesPerUnit: finalPiecesPerUnit,
      price: currentPrice,
      description: description.trim(),
      imageUrl: finalImageUrl || undefined,
      imageUrls: addImgs.length > 0 ? addImgs : undefined,
      isPinned,
      isPopular,
      gachaPool: (category === 'สุ่มตัวละคร - ออสตา' || (gachaPool && gachaPool.length > 0)) ? gachaPool : undefined,
      accountCredentials: accCreds.length > 0 ? accCreds : undefined,
    });
    
    onClose();
  };

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

        {/* Form panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-w-lg w-full rounded-2xl border border-white/5 bg-transparent p-6 overflow-hidden shadow-2xl z-10 max-h-[90dvh] overflow-y-auto"
        >
          {/* Neon orange accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-600 to-amber-400" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5 mt-2">
            <div>
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{editingItem ? 'แก้ไขสต๊อกสินค้า' : 'เพิ่มไอเทมใหม่ในระบบ'}</span>
              </h3>
              <p className="text-xs text-zinc-400 font-display tracking-tight mt-0.5">
                กรอกรายละเอียดไอเทมในเกม Attack on Titan Revolution ของคลังสต๊อกคุณ
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 font-display tracking-tight">
                ชื่อไอเทม (Item Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Yeager Bloodline, Attack Serum..."
                className={`w-full bg-zinc-900 border text-zinc-100 px-3.5 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-display tracking-tight font-medium placeholder-zinc-600 ${
                  errors.name ? 'border-red-500/80 bg-red-950/10' : 'border-white/5'
                }`}
              />
              {errors.name && (
                <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Category selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2 font-display tracking-tight">
                เลือกหมวดหมู่ไอเทม (Item Category) <span className="text-zinc-400 font-normal">(คลิกเลือกโดยตรง)</span>
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-1.5 p-2 rounded-2xl bg-zinc-800 border border-white/5/40">
                {(['Grow A Garden 2', 'ALL STAR', 'ROV']).map((cat) => {
                  const isActive = category === cat;
                  return (
                    <motion.button whileTap={{ scale: 0.95 }}
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 border cursor-pointer select-none ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/80 text-amber-400 font-extrabold shadow-sm shadow-amber-500/5'
                          : 'bg-zinc-900/60 border-zinc-850 hover:border-white/10 text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      <span className="text-sm">
                        {cat === 'Grow A Garden 2' && '🌱'}
                        {cat === 'ALL STAR' && '⭐'}
                        {cat === 'ROV' && '🎮'}
                      </span>
                      <span className="truncate">{cat}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 font-display tracking-tight">
                รูปแบบการขาย (Sale Format)
              </label>
              <select
                value={saleFormat}
                onChange={(e) => setSaleFormat(e.target.value as 'ขายรหัส' | 'กล่องสุ่ม')}
                className="w-full bg-zinc-900 border border-white/5 text-zinc-200 px-3 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-amber-500 transition-all cursor-pointer font-display tracking-tight"
              >
                <option value="ขายรหัส">ขายรหัส</option>
                <option value="กล่องสุ่ม">กล่องสุ่ม</option>
              </select>
            </div>
            {/* Quantity, Initial Quantity, Pieces per pack, and Price row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 font-display tracking-tight flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>เหลือในสต๊อก (สต๊อก)</span>
                  </div>
                </label>
                {(category === 'Starter Accounts' || category === 'รหัส ROV' || category === 'ไอดี ROV') ? (
                  <div className="w-full bg-zinc-900 border border-zinc-850 text-emerald-400/50 px-3 py-2 rounded-2xl text-sm font-mono font-bold cursor-not-allowed flex items-center h-[38px]">
                    {accountCredentialsText.trim() ? accountCredentialsText.trim().split('\n').filter(c => c.trim().length > 0).length : 0}
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-emerald-400 px-3 py-2 rounded-2xl text-sm focus:outline-none focus:border-amber-500 transition-all font-mono font-bold"
                  />
                )}
                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 font-display tracking-tight flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>จำนวนแรกรวม</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="ปล่อยว่างเพื่อเท่าคงเหลือ"
                  value={initialQuantity}
                  onChange={(e) => setInitialQuantity(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 px-3 py-2 rounded-2xl text-sm focus:outline-none focus:border-amber-500 transition-all font-mono font-medium placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 font-display tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>จำนวนชิ้นต่อชุด</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="เช่น 360 ชิ้นต่อ 1 สต๊อก"
                  value={piecesPerUnit}
                  onChange={(e) => setPiecesPerUnit(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 text-amber-400 px-3 py-2 rounded-2xl text-sm focus:outline-none focus:border-amber-500 transition-all font-mono font-medium placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 font-display tracking-tight flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  <span>ราคาบาทต่อชิ้น/ชุด (Price ฿)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 text-zinc-100 px-3 py-2 rounded-2xl text-sm focus:outline-none focus:border-amber-500 transition-all font-mono font-medium"
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
            </div>

            {/* Live Calculation Preview Block */}
            {(() => {
              const currentQty = typeof quantity === 'number' ? quantity : (parseInt(quantity as string, 10) || 0);
              const pCount = piecesPerUnit ? (parseInt(piecesPerUnit as string, 10) || 1) : 1;
              const totalItems = currentQty * pCount;
              if (pCount > 1) {
                return (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-amber-300 font-medium">💡 คำนวณคลังเสมือนจริง:</span>
                    <span className="text-xs font-mono text-zinc-300">
                      ได้สินค้า <strong className="text-amber-400 font-extrabold">{pCount}</strong> ชิ้นต่อชุด × สต๊อกมี <strong className="text-emerald-400 font-extrabold">{currentQty}</strong> ชุด = จะมีของข้างในรวมทั้งหมด <strong className="text-white text-sm bg-zinc-900 px-2 py-0.5 rounded-md border border-white/5 font-extrabold">{totalItems} ชิ้น</strong>
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Description textarea */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 font-display tracking-tight">
                คำอธิบายคุณสมบัติ (Item Description)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุสถานะหรือบัฟ เช่น 'เพิ่มโอกาสดรอป 20%, ดาเมจฟันไททันแรงขึ้น...'"
                rows={3}
                className="w-full bg-zinc-900 border border-white/5 text-zinc-200 px-3 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-amber-500 transition-all font-display tracking-tight placeholder-zinc-600 resize-none"
              />
            </div>

            {/* Switches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 bg-zinc-900/60  p-3 rounded-2xl border border-white/5/80">
                <input
                  type="checkbox"
                  id="pin-checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="pin-checkbox" className="text-xs font-semibold text-zinc-350 cursor-pointer font-display tracking-tight select-none flex items-center gap-1">
                  <span>📌 ปักหมุดให้อยู่บนสุด</span>
                </label>
              </div>

              <div className="flex items-center gap-2.5 bg-zinc-900/60  p-3 rounded-2xl border border-white/5/80">
                <input
                  type="checkbox"
                  id="popular-checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
                <label htmlFor="popular-checkbox" className="text-xs font-semibold text-zinc-350 cursor-pointer font-display tracking-tight select-none flex items-center gap-1.5">
                  <span>🔥 สินค้ายอดนิยม (Popular)</span>
                </label>
              </div>
            </div>

            {(category === 'Starter Accounts' || category === 'รหัส ROV' || category === 'ไอดี ROV') && (
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block font-display tracking-tight">
                    สต๊อกไอดี / รหัสผ่าน (Line by Line)
                  </span>
                  <span className="text-[10px] text-zinc-400">จำนวนสต๊อกจะนับตามบรรทัดอัตโนมัติ</span>
                </div>
                <textarea
                  value={accountCredentialsText}
                  onChange={e => setAccountCredentialsText(e.target.value)}
                  placeholder="USER1:PASS1&#10;USER2:PASS2..."
                  className="w-full bg-transparent border border-white/5 text-zinc-200 px-3 py-2 rounded-2xl text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500 h-32 resize-y"
                />
              </div>
            )}

            {category === 'สุ่มตัวละคร - ออสตา' && (
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block font-display tracking-tight">
                    ตั้งค่าของรางวัลในกล่องสุ่ม (Gacha Pool)
                  </span>
                  <motion.button whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setGachaPool([...gachaPool, { id: Date.now().toString(), name: '' }])}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่ม
                  </motion.button>
                </div>
                
                {gachaPool.length > 0 ? (
                  <div className="space-y-2">
                    {gachaPool.map((reward, index) => (
                      <div key={reward.id} className="flex flex-col gap-2 p-2 bg-zinc-800 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="ชื่อตัวละคร/ไอเทม..."
                            value={reward.name}
                            onChange={(e) => {
                              const newPool = [...gachaPool];
                              newPool[index].name = e.target.value;
                              setGachaPool(newPool);
                            }}
                            className="flex-1 bg-transparent border border-white/5 text-zinc-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 transition-all font-display tracking-tight"
                          />
                          <input
                            type="color"
                            value={reward.color || '#F59E0B'}
                            onChange={(e) => {
                              const newPool = [...gachaPool];
                              newPool[index].color = e.target.value;
                              setGachaPool(newPool);
                            }}
                            className="w-8 h-8 rounded shrink-0 cursor-pointer bg-transparent border border-white/5 p-0.5"
                          />
                          <motion.button whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setGachaPool(gachaPool.filter((_, i) => i !== index))}
                            className="p-2 bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 font-display tracking-tight whitespace-nowrap">สต๊อกที่การันตีออก (คั่นด้วยลูกน้ำ, ปล่อยว่างถ้าไม่มี):</span>
                          <input
                            type="text"
                            placeholder="เช่น 1791, 993"
                            value={
                              reward.guaranteedAtStocks 
                                ? reward.guaranteedAtStocks.join(', ') 
                                : (reward.guaranteedAtStock !== undefined ? String(reward.guaranteedAtStock) : '')
                            }
                            onChange={(e) => {
                              const newPool = [...gachaPool];
                              const val = e.target.value;
                              if (val.trim() === '') {
                                newPool[index].guaranteedAtStock = undefined;
                                newPool[index].guaranteedAtStocks = undefined;
                              } else {
                                const parts = val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                                if (parts.length === 1) {
                                  newPool[index].guaranteedAtStock = parts[0];
                                  newPool[index].guaranteedAtStocks = undefined;
                                } else if (parts.length > 1) {
                                  newPool[index].guaranteedAtStock = undefined;
                                  newPool[index].guaranteedAtStocks = parts;
                                }
                              }
                              setGachaPool(newPool);
                            }}
                            className="flex-1 bg-transparent border border-white/5 text-zinc-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-amber-500 transition-all font-mono"
                          />
                        </div>

                        {/* Status Check if dropped */}
                        {(() => {
                           const currentQty = typeof quantity === 'number' ? quantity : (parseInt(quantity as string, 10) || 0);
                           let stocksToCheck: number[] = [];
                           if (reward.guaranteedAtStocks) stocksToCheck = reward.guaranteedAtStocks;
                           else if (reward.guaranteedAtStock !== undefined) stocksToCheck = [reward.guaranteedAtStock];
                           
                           if (stocksToCheck.length > 0) {
                              const claims = claimedJackpots.filter(c => c.reward_name === reward.name && stocksToCheck.includes(c.stock_trigger));
                              const droppedCount = claims.length;
                              const droppedUnknownCount = stocksToCheck.filter(s => s > currentQty).length - droppedCount;
                              const totalDropped = droppedCount + (droppedUnknownCount > 0 ? droppedUnknownCount : 0);
                              const unDroppedCount = stocksToCheck.length - totalDropped;
                              
                              const winnersMsg = claims.length > 0 ? ` (ผู้รับ: ${claims.map(c => c.username).join(', ')})` : '';

                              return (
                                <div className="text-[10px] flex items-center justify-between px-1">
                                  {totalDropped > 0 && <span className="text-red-400 font-bold">ออกไปแล้ว: {totalDropped} ชุด{winnersMsg}</span>}
                                  {unDroppedCount > 0 && <span className="text-emerald-400 font-bold">รอออกกระดานหน้า: {unDroppedCount} ชุด</span>}
                                </div>
                              );
                           }
                           return null;
                        })()}

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-zinc-400 border border-dashed border-white/5 rounded-2xl bg-zinc-800">
                    ยังไม่มีของรางวัลในกล่อง กำหนดไอเทมที่โอกาสดรอปได้เลย
                  </div>
                )}
              </div>
            )}

            {/* Image Source selector options */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block font-display tracking-tight">
                รูปภาพประจำไอเทม (Visual Asset Selector)
              </span>

              {/* Source tabs selector */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-transparent border border-zinc-850 text-xs">
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setImageType('url')}
                  className={`py-1.5 rounded-md font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    imageType === 'url' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  <span>ใส่ลิงก์รูปภาพ</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setImageType('upload')}
                  className={`py-1.5 rounded-md font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    imageType === 'upload' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>อัปโหลดรูปภาพ</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setImageType('presets')}
                  className={`py-1.5 rounded-md font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    imageType === 'presets' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>รูปภาพตัวอย่าง</span>
                </motion.button>
              </div>

              {/* Content of selected Tab */}
              {imageType === 'url' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... หรือ ลิงก์รูปภาพอื่นๆ"
                    className="w-full bg-transparent border border-zinc-850 text-zinc-100 px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                  {imageUrl && (
                    <div className="mt-2 text-center">
                      <p className="text-[10px] text-zinc-400 text-left mb-1">รูปภาพพรีวิวจากการกรอกลิงก์:</p>
                      <div className="inline-block relative w-32 h-20 rounded-md overflow-hidden bg-transparent border border-white/5">
                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => setErrors({ ...errors, image: 'พรีวิวรูปภาพจากลิงก์ล้มเหลว' })} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {imageType === 'upload' && (
                <div className="space-y-2 animate-fadeIn">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragActive
                        ? 'border-amber-500 bg-amber-500/5'
                        : uploadedImages.length > 0
                        ? 'border-white/10 bg-zinc-900/60'
                        : 'border-white/5 hover:border-white/10 hover:bg-zinc-900/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {uploadedImages.length > 0 ? (
                      <div className="text-center space-y-2">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {uploadedImages.map((img, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-transparent border border-white/5">
                              <img src={img} alt="upload preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedImages(prev => prev.filter((_, idx) => idx !== i));
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-emerald-400 font-medium">อัปโหลดสำเร็จ {uploadedImages.length} รูป! อัปโหลดเพิ่มคลิกที่นี่</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-7 h-7 text-zinc-400 mb-1.5" />
                        <span className="text-xs text-zinc-300 font-medium font-display tracking-tight">ลากไฟล์รูปภาพมาวาง หรือคลิกเพื่อค้นหารูป</span>
                        <span className="text-[10px] text-zinc-400 mt-1 font-mono">ฟอร์แมต JPG, PNG, WEBP จากเครื่องคุณ</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {imageType === 'presets' && (
                <div className="space-y-2 animate-fadeIn">
                  <p className="text-[10px] text-zinc-400 font-display tracking-tight">คลิกลือกภาพม็อคเพื่อเติมเต็มรายละเอียดความสวยงามได้รวดเร็ว:</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PRESET_IMAGE_SUGGESTIONS.map((preset) => (
                      <motion.button whileTap={{ scale: 0.95 }}
                        type="button"
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset.url)}
                        className="group relative h-16 rounded-lg overflow-hidden border border-white/5 hover:border-amber-500 transition-all text-left flex items-end p-1 cursor-pointer bg-transparent"
                      >
                        <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all" />
                        <span className="relative text-[9px] text-white font-bold leading-none bg-black/80 p-0.5 rounded border border-white/5/30 w-full text-center truncate">
                          {preset.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block font-display tracking-tight">
                  รูปภาพเพิ่มเติม (Additional Images URL)
                </span>
                <span className="text-[10px] text-zinc-400">1 บรรทัดต่อ 1 ลิงก์</span>
              </div>
              <textarea
                value={imageUrlsText}
                onChange={e => setImageUrlsText(e.target.value)}
                placeholder="https://images.unsplash.com/...\nhttps://images.unsplash.com/..."
                className="w-full bg-transparent border border-white/5 text-zinc-200 px-3 py-2 rounded-2xl text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500 h-24 resize-y"
              />
            </div>

            {/* Submit and Cancel items */}
            <div className="flex gap-2.5 border-t border-white/5 pt-4 mt-5">
              <motion.button whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 rounded-2xl border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 bg-transparent text-xs font-bold transition-all cursor-pointer"
              >
                ยกเลิก
              </motion.button>

              <motion.button whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-1/2 py-2.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-100 text-black border-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
                id="btn-submit-stock"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึกข้อมูลสต๊อก</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
