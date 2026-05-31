import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock } from 'lucide-react';
import { AnnouncementSettings } from './AnnouncementManagerModal';

interface AnnouncementPopupProps {
  appScreen: 'ATOR' | 'AOTR' | 'ASTD' | string;
}

export const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ appScreen }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const rawSettings = localStorage.getItem('KUWASHII_ANNOUNCEMENT_SETTINGS');
    if (!rawSettings) return;

    try {
      const parsed: AnnouncementSettings = JSON.parse(rawSettings);
      
      // Check if disabled globally or for this screen
      if (!parsed.enabled) return;
      if ((appScreen === 'ATOR' || appScreen === 'AOTR') && !parsed.showInATOR) return;
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
      setCurrentIndex(0);
    } catch (e) {
      console.error(e);
    }
  }, [appScreen]);

  const getAnnouncementsCount = () => {
    if (!settings) return 0;
    let count = 1;
    if (settings.imageUrl2) count++;
    return count;
  };

  const handleClose = () => {
    if (currentIndex < getAnnouncementsCount() - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handleMute = () => {
    const hideUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    localStorage.setItem('KUWASHII_HIDE_ANNOUNCEMENT_UNTIL', hideUntil.toString());
    
    if (currentIndex < getAnnouncementsCount() - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible || !settings) return null;

  const announcements = [
    { image: settings.imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e', link: settings.linkUrl }
  ];
  if (settings.imageUrl2) {
    announcements.push({ image: settings.imageUrl2, link: settings.linkUrl2 });
  }

  const current = announcements[currentIndex];

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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative max-w-sm w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col font-sans overflow-hidden"
        >
          {current.link ? (
            <a href={current.link} target="_blank" rel="noopener noreferrer" className="block w-full">
               <img 
                 src={current.image} 
                 alt="Announcement" 
                 className="w-full h-auto object-cover" 
               />
            </a>
          ) : (
            <img 
              src={current.image} 
              alt="Announcement" 
              className="w-full h-auto object-cover" 
            />
          )}

          {announcements.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-3 pb-1 bg-zinc-950">
              {announcements.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'bg-amber-500 w-3' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          )}
          
          <div className="p-3 bg-zinc-950 flex flex-row items-center gap-2 justify-center">
            <button
               onClick={handleClose}
               className="flex-1 justify-center flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white font-medium text-[11px] transition-colors"
            >
               <X className="w-3 h-3" /> ปิดหน้าต่างนี้
            </button>
            <button
               onClick={handleMute}
               className="flex-1 justify-center flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-zinc-400 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white font-medium text-[11px] transition-colors"
            >
               <Clock className="w-3 h-3" /> ไม่แสดง 1 ชม.
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
