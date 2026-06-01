import React, { useEffect, useState } from 'react';
import { AnnouncementSettings } from './AnnouncementManagerModal';

interface MarqueeAnnouncementProps {
  appScreen: string;
}

export const MarqueeAnnouncement: React.FC<MarqueeAnnouncementProps> = ({ appScreen }) => {
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('KUWASHII_ANNOUNCEMENT_SETTINGS');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch(e) {}
      }
    };
    
    loadSettings();
    window.addEventListener('storage', loadSettings);
    window.addEventListener('sync-announcement', loadSettings);
    
    return () => {
      window.removeEventListener('storage', loadSettings);
      window.removeEventListener('sync-announcement', loadSettings);
    };
  }, []);

  const marqueeItems = settings?.marqueeTexts?.filter(t => t.trim() !== '') || (settings?.marqueeText ? [settings.marqueeText] : []);

  if (!settings?.marqueeEnabled || marqueeItems.length === 0) return null;
  if (appScreen === 'AOTR' && !settings.showInATOR) return null;
  if (appScreen === 'ASTD' && !settings.showInASTD) return null;

  return (
    <>
      {/* Spacer so the fixed nav doesn't cover content below it */}
      <div className="h-7 w-full flex-none shrink-0" />
      <div 
        className="flex-none fixed top-0 left-0 z-[100] w-full overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        style={{
          backgroundColor: settings.marqueeBgColor || '#f59e0b',
          color: settings.marqueeTextColor || '#000000'
        }}
      >
        <div className="w-full pt-[env(safe-area-inset-top,0px)]">
          <div className="w-full pt-1.5 pb-1">
            <div 
              className="animate-marquee flex items-center h-full gap-8 leading-tight w-max"
              style={{ animationDuration: `${settings.marqueeSpeed || 15}s` }}
            >
              {[...Array(20)].map((_, i) => (
                <React.Fragment key={i}>
                  {marqueeItems.map((text, idx) => (
                    <React.Fragment key={`${i}-${idx}`}>
                      <span className="font-bold text-xs sm:text-sm tracking-wide px-4 flex items-center mt-0.5 whitespace-nowrap">
                        {text}
                      </span>
                      <span className="opacity-30 text-[10px] sm:text-xs shrink-0 mt-0.5 whitespace-nowrap">✦</span>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
