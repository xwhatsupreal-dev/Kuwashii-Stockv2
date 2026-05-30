import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock } from 'lucide-react';
import { AnnouncementSettings } from './AnnouncementManagerModal';

interface AnnouncementPopupProps {
  appScreen: 'ATOR' | 'ASTD';
}

export const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ appScreen }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);

  useEffect(() => {
    const rawSettings = localStorage.getItem('KUWASHII_ANNOUNCEMENT_SETTINGS');
    if (!rawSettings) return;

    try {
      const parsed: AnnouncementSettings = JSON.parse(rawSettings);
      
      // Check if disabled globally or for this screen
      if (!parsed.enabled) return;
      if (appScreen === 'ATOR' && !parsed.showInATOR) return;
      if (appScreen === 'ASTD' && !parsed.showInASTD) return;

      // Check user mute duration
      const hideUntil = localStorage.getItem('KUWASHII_HIDE_ANNOUNCEMENT_UNTIL');
      if (hideUntil && parseInt(hideUntil) > Date.now()) {
        const lastUpdated = localStorage.getItem('KUWASHII_ANNOUNCEMENT_UPDATED_AT');
        if (!lastUpdated || parseInt(hideUntil) > parseInt(lastUpdated)) {
           return;
        }
      }

      setSettings(parsed);
      setIsVisible(true);
    } catch (e) {
      console.error(e);
    }
  }, [appScreen]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleMute = () => {
    const hideUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    localStorage.setItem('KUWASHII_HIDE_ANNOUNCEMENT_UNTIL', hideUntil.toString());
    setIsVisible(false);
  };

  if (!isVisible || !settings) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl flex flex-col font-sans overflow-hidden"
        >
          {settings.linkUrl ? (
            <a href={settings.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
               <img 
                 src={settings.imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e'} 
                 alt="Announcement" 
                 className="w-full object-cover" 
               />
            </a>
          ) : (
            <img 
              src={settings.imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e'} 
              alt="Announcement" 
              className="w-full object-cover" 
            />
          )}
          
          <div className="p-4 bg-white border-t flex items-center gap-3 justify-center sm:justify-end">
            <button
               onClick={handleClose}
               className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-rose-500 border border-rose-500/30 hover:bg-rose-50 hover:border-rose-500 font-bold text-sm transition-colors"
            >
               <X className="w-4 h-4" /> ปิดหน้าต่างนี้
            </button>
            <button
               onClick={handleMute}
               className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-cyan-600 border border-cyan-500/30 hover:bg-cyan-50 hover:border-cyan-500 font-bold text-sm transition-colors"
            >
               <Clock className="w-4 h-4" /> ไม่แสดงอีก 1 ชม.
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
