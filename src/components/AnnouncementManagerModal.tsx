import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Image as ImageIcon, Save, Check, Type } from 'lucide-react';
import { supabase } from '../supabase';

interface AnnouncementManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AnnouncementSettings {
  enabled: boolean;
  imageUrl: string;
  linkUrl: string;
  imageUrl2: string;
  linkUrl2: string;
  showInATOR: boolean;
  showInASTD: boolean;
  marqueeEnabled?: boolean;
  marqueeText?: string; // Keep for backward compatibility
  marqueeTexts?: string[];
  marqueeSpeed?: number;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
}

const DEFAULT_SETTINGS: AnnouncementSettings = {
  enabled: false,
  imageUrl: '',
  linkUrl: '',
  imageUrl2: '',
  linkUrl2: '',
  showInATOR: true,
  showInASTD: true,
  marqueeEnabled: false,
  marqueeTexts: ['ยินดีต้อนรับเข้าสู่เว็บไซต์!'],
  marqueeSpeed: 15,
  marqueeBgColor: '#f59e0b',
  marqueeTextColor: '#000000',
};

export const AnnouncementManagerModal: React.FC<AnnouncementManagerModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AnnouncementSettings>(DEFAULT_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('KUWASHII_ANNOUNCEMENT_SETTINGS');
      if (saved) {
        setSettings(JSON.parse(saved));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    localStorage.setItem('KUWASHII_ANNOUNCEMENT_SETTINGS', JSON.stringify(settings));
    localStorage.setItem('KUWASHII_ANNOUNCEMENT_UPDATED_AT', Date.now().toString());
    
    try {
      await supabase.from('system_config').upsert({ id: 'main', announcement_settings: settings });
    } catch(e) {}
    
    window.dispatchEvent(new Event('sync-announcement'));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 "
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[85dvh] bg-zinc-950 border border-white/5 rounded-3xl shadow-2xl flex flex-col font-sans overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-900 bg-zinc-900  shrink-0">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">ระบบจัดการแจ้งเตือน</h2>
                <p className="text-sm text-zinc-500 font-mono mt-1">Announcement Popup Settings</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            <label className="flex items-center gap-3 p-4 bg-zinc-900 border border-white/5 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5 rounded bg-zinc-800 border-white/10 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-white font-bold text-sm">เปิดใช้งานแจ้งเตือน (Enable Popup)</span>
            </label>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> ลิงก์รูปภาพแจ้งเตือน 1 (Image URL 1)
              </label>
              <input
                type="text"
                value={settings.imageUrl}
                onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-zinc-900 border border-white/5 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm font-sans mb-3"
              />
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                 ลิงก์โปรโมท 1 (Link URL 1)
              </label>
              <input
                type="text"
                value={settings.linkUrl}
                onChange={(e) => setSettings({ ...settings, linkUrl: e.target.value })}
                placeholder="https://... (เว้นว่างได้)"
                className="w-full bg-zinc-900 border border-white/5 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm font-sans"
              />
            </div>

            <div className="pt-4 border-t border-white/5/50">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> ลิงก์รูปภาพแจ้งเตือน 2 (Image URL 2 - เสริม)
              </label>
              <input
                type="text"
                value={settings.imageUrl2 || ''}
                onChange={(e) => setSettings({ ...settings, imageUrl2: e.target.value })}
                placeholder="https://... (เว้นว่างได้)"
                className="w-full bg-zinc-900 border border-white/5 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm font-sans mb-3"
              />
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                 ลิงก์โปรโมท 2 (Link URL 2)
              </label>
              <input
                type="text"
                value={settings.linkUrl2 || ''}
                onChange={(e) => setSettings({ ...settings, linkUrl2: e.target.value })}
                placeholder="https://... (เว้นว่างได้)"
                className="w-full bg-zinc-900 border border-white/5 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 bg-zinc-900 border border-white/5 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showInATOR}
                  onChange={(e) => setSettings({ ...settings, showInATOR: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-800 border-white/10 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-zinc-300 font-bold text-xs flex-1">แสดงในหน้า ATOR</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-900 border border-white/5 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showInASTD}
                  onChange={(e) => setSettings({ ...settings, showInASTD: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-800 border-white/10 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-zinc-300 font-bold text-xs flex-1">แสดงในหน้า ASTD</span>
              </label>
            </div>

            <div className="pt-4 border-t border-white/5/50">
              <label className="flex items-center gap-3 p-4 bg-zinc-900 border border-white/5 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors mb-4">
                <input
                  type="checkbox"
                  checked={settings.marqueeEnabled || false}
                  onChange={(e) => setSettings({ ...settings, marqueeEnabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-zinc-800 border-white/10 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-white font-bold text-sm">เปิดใช้งานแถบประกาศเลื่อน (Marquee)</span>
              </label>

              {settings.marqueeEnabled && (
                <>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                    <Type className="w-3 h-3" /> ข้อความประกาศ (ขึ้นบรรทัดใหม่เพื่อแยกข้อความ)
                  </label>
                  <textarea
                    value={(settings.marqueeTexts || (settings.marqueeText ? [settings.marqueeText] : [])).join('\n')}
                    onChange={(e) => setSettings({ ...settings, marqueeTexts: e.target.value.split('\n') })}
                    placeholder="ข้อความที่ 1&#10;ข้อความที่ 2"
                    className="w-full bg-zinc-900 border border-white/5 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm font-sans mb-3 min-h-[100px] resize-y"
                  />
                  
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                    ความเร็ว (วินาทีต่อ 1 รอบ)
                  </label>
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="range"
                      min="1"
                      max="150"
                      value={settings.marqueeSpeed || 15}
                      onChange={(e) => setSettings({ ...settings, marqueeSpeed: parseInt(e.target.value) || 15 })}
                      className="flex-1 accent-amber-500"
                    />
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={settings.marqueeSpeed || 15}
                      onChange={(e) => setSettings({ ...settings, marqueeSpeed: parseInt(e.target.value) || 15 })}
                      className="w-16 bg-zinc-900 border border-white/5 text-zinc-100 px-2 py-1 rounded-lg focus:outline-none focus:border-amber-500 transition-all text-sm font-sans text-center"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 mb-3">ค่าน้อย = เร็ว / ค่ามาก = ช้า (แนะนำ: 10 - 20)</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                        สีพื้นหลัง (Background)
                      </label>
                      <div className="flex bg-zinc-900 border border-white/5 rounded-xl overflow-hidden focus-within:border-amber-500 transition-all">
                        <input
                          type="color"
                          value={settings.marqueeBgColor || '#f59e0b'}
                          onChange={(e) => setSettings({ ...settings, marqueeBgColor: e.target.value })}
                          className="w-10 h-10 p-1 bg-transparent cursor-pointer border-none outline-none"
                        />
                        <input
                          type="text"
                          value={settings.marqueeBgColor || '#f59e0b'}
                          onChange={(e) => setSettings({ ...settings, marqueeBgColor: e.target.value })}
                          className="flex-1 bg-transparent border-none text-zinc-100 px-3 text-xs outline-none uppercase font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                        สีข้อความ (Text)
                      </label>
                      <div className="flex bg-zinc-900 border border-white/5 rounded-xl overflow-hidden focus-within:border-amber-500 transition-all">
                        <input
                          type="color"
                          value={settings.marqueeTextColor || '#000000'}
                          onChange={(e) => setSettings({ ...settings, marqueeTextColor: e.target.value })}
                          className="w-10 h-10 p-1 bg-transparent cursor-pointer border-none outline-none"
                        />
                        <input
                          type="text"
                          value={settings.marqueeTextColor || '#000000'}
                          onChange={(e) => setSettings({ ...settings, marqueeTextColor: e.target.value })}
                          className="flex-1 bg-transparent border-none text-zinc-100 px-3 text-xs outline-none uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <motion.button whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-zinc-900 transition-all text-sm flex items-center justify-center gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-5 h-5 text-zinc-900" /> บันทึกสำเร็จ
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> บันทึกการตั้งค่า
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
