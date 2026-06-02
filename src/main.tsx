import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSyncEngine } from './lib/syncEngine';

function RootComponent() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initSyncEngine().finally(() => {
      setIsInitializing(false);
    });
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
         <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
         <p className="text-zinc-500 text-sm font-bold animate-pulse">กำลังตรวจสอบการเชื่อมต่อฐานข้อมูล...</p>
      </div>
    );
  }

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<RootComponent />);
