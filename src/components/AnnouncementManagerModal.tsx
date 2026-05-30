import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Image as ImageIcon, Save, Check, Type } from 'lucide-react';

interface AnnouncementManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AnnouncementSettings {
  enabled: boolean;
  imageUrl: string;
  linkUrl: string;
  showInATOR: boolean;
  showInASTD: boolean;
}

const DEFAULT_SETTINGS: AnnouncementSettings = {
  enabled: false,
  imageUrl: '',
  linkUrl: '',
  showInATOR: true,
  showInASTD: true,
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

  const handleSave = () => {
    localStorage.setItem('KUWASHII_ANNOUNCEMENT_SETTINGS', JSON.stringify(settings));
    // Clear out user hide status when admin updates
    localStorage.setItem('KUWASHII_ANNOUNCEMENT_UPDATED_AT', Date.now().toString());
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
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col font-sans overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/40 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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

          <div className="p-6 space-y-5">
            <label className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-white font-bold text-sm">เปิดใช้งานแจ้งเตือน (Enable Popup)</span>
            </label>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> ลิงก์รูปภาพแจ้งเตือน (Image URL)
              </label>
              <input
                type="text"
                value={settings.imageUrl}
                onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm font-sans"
              />
              {settings.imageUrl && (
                <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-zinc-800">
                  <img src={settings.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                 ลิงก์โปรโมท (Link URL เมื่อคลิกรูป)
              </label>
              <input
                type="text"
                value={settings.linkUrl}
                onChange={(e) => setSettings({ ...settings, linkUrl: e.target.value })}
                placeholder="https://... (เว้นว่างได้)"
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showInATOR}
                  onChange={(e) => setSettings({ ...settings, showInATOR: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-zinc-300 font-bold text-xs flex-1">แสดงในหน้า ATOR</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showInASTD}
                  onChange={(e) => setSettings({ ...settings, showInASTD: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-zinc-300 font-bold text-xs flex-1">แสดงในหน้า ASTD</span>
              </label>
            </div>

            <button
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
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
