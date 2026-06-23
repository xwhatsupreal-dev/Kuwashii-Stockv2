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
  const [activeAnnouncements, setActiveAnnouncements] = useState<{ image: string, link: string, originalIndex: number }[]>([]);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0);

  useEffect(() => {
    const rawSettings = localStorage.getItem('KUWASHII_ANNOUNCEMENT_SETTINGS');
    if (!rawSettings) return;

    try {
      const parsed: AnnouncementSettings = JSON.parse(rawSettings);
      
      // Check if disabled globally or for this screen
      if (!parsed.enabled) return;
      if ((appScreen === 'ATOR' || appScreen === 'AOTR') && !parsed.showInATOR) return;
      if (appScreen === 'ASTD' && !parsed.showInASTD) return;

      const allAnnouncements = [
        { image: parsed.imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e', link: parsed.linkUrl }
      ];
      if (parsed.imageUrl2) {
        allAnnouncements.push({ image: parsed.imageUrl2, link: parsed.linkUrl2 });
      }

      // Check user mute duration per announcement
      const mutedDataRaw = localStorage.getItem('KUWASHII_MUTED_ANNOUNCEMENTS');
      const mutedData = mutedDataRaw ? JSON.parse(mutedDataRaw) : {};
      const now = Date.now();
      const lastUpdated = localStorage.getItem('KUWASHII_ANNOUNCEMENT_UPDATED_AT') || '0';

      const visible = allAnnouncements
        .map((a, index) => ({ ...a, originalIndex: index }))
        .filter(a => {
           const hideUntil = mutedData[a.image];
           if (hideUntil && parseInt(hideUntil) > now) {
              if (parseInt(hideUntil) > parseInt(lastUpdated)) {
                 return false;
              }
           }
           // Also check global legacy mute
           const globalHideUntil = localStorage.getItem('KUWASHII_HIDE_ANNOUNCEMENT_UNTIL');
           if (globalHideUntil && parseInt(globalHideUntil) > now) {
              if (parseInt(globalHideUntil) > parseInt(lastUpdated)) {
                 return false;
              }
           }
           return true;
        });

      if (visible.length === 0) return;

      setTimeout(() => {
        setSettings(parsed);
        setActiveAnnouncements(visible);
        setIsVisible(true);
        setCurrentActiveIndex(0);
      }, 500);
    } catch (e) {
      console.error(e);
    }
  }, [appScreen]);

  const handleClose = () => {
    if (currentActiveIndex < activeAnnouncements.length - 1) {
      setCurrentActiveIndex(currentActiveIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handleMute = () => {
    const currentInfo = activeAnnouncements[currentActiveIndex];
    const hideUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    
    try {
      const mutedDataRaw = localStorage.getItem('KUWASHII_MUTED_ANNOUNCEMENTS');
      const mutedData = mutedDataRaw ? JSON.parse(mutedDataRaw) : {};
      mutedData[currentInfo.image] = hideUntil.toString();
      localStorage.setItem('KUWASHII_MUTED_ANNOUNCEMENTS', JSON.stringify(mutedData));
    } catch (e) {
      console.error(e);
    }
    
    if (currentActiveIndex < activeAnnouncements.length - 1) {
      setCurrentActiveIndex(currentActiveIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  if (!settings || activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[currentActiveIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-black/80 " />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentActiveIndex}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
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

              {activeAnnouncements.length > 1 && (
                <div className="flex justify-center gap-1.5 pt-3 pb-1 bg-zinc-950">
                  {activeAnnouncements.map((_, idx) => (
                    <motion.button whileTap={{ scale: 0.95 }}
                      key={idx}
                      onClick={() => setCurrentActiveIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        currentActiveIndex === idx ? 'bg-amber-500 w-3' : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              <div className="p-3 bg-zinc-950 flex flex-row items-center gap-2 justify-center">
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="flex-1 justify-center flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white font-medium text-[11px] transition-colors"
                >
                  <X className="w-3 h-3" /> ปิดหน้าต่างนี้
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={handleMute}
                  className="flex-1 justify-center flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-zinc-400 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white font-medium text-[11px] transition-colors"
                >
                  <Clock className="w-3 h-3" /> ไม่แสดง 1 ชม.
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
