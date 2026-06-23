import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const FakeTurnstile = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [status, setStatus] = useState<'verifying' | 'success'>('verifying');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
      if (onSuccess) onSuccess();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onSuccess]);

  return (
    <div className="w-full bg-[#353535] rounded-sm p-3 flex items-center justify-between shadow-sm my-4 h-[65px]">
      <div className="flex items-center gap-3">
        {status === 'verifying' ? (
          <div className="w-6 h-6 rounded-full border-2 border-[#1b1b1b] border-t-white animate-spin ml-1" />
        ) : (
          <div className="w-6 h-6 rounded-sm bg-[#00c563] flex items-center justify-center ml-1">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        )}
        <span className="text-[#e2e2e2] text-[13px] font-medium ml-1">
          {status === 'verifying' ? 'Verifying...' : 'Success!'}
        </span>
      </div>
      <div className="flex flex-col items-end mr-1">
        <div className="flex items-center gap-1 mb-0.5">
          <svg className="w-8 h-5 text-[#f38020]" viewBox="0 0 48 32" fill="currentColor">
            <path d="M14.07,24.16c0,0-5.46,0-8.23,0c-3.26,0-5.84-2.67-5.84-6s2.58-6,5.84-6c0.55,0,1.07,0.08,1.57,0.22 c1.18-4.7,5.5-8.15,10.7-8.15c4.71,0,8.74,2.83,10.38,6.86c0.56-0.06,1.13-0.1,1.72-0.1c4.54,0,8.23,3.78,8.23,8.44 c0,4.66-3.69,8.44-8.23,8.44c-2.48,0-5.74,0-5.74,0" fill="transparent" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M28.32,24.16c0,0,4.61,0,6.95,0c3.81,0,6.9-3.16,6.9-7.06s-3.09-7.06-6.9-7.06c-0.64,0-1.27,0.09-1.87,0.26 c-1.4-5.54-6.52-9.61-12.69-9.61c-5.58,0-10.36,3.34-12.31,8.09" fill="transparent" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-[11px] font-bold tracking-widest uppercase">Cloudflare</span>
        </div>
        <div className="text-[#a0a0a0] text-[9px] flex gap-1 -mt-1">
          <a href="#" className="hover:underline">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:underline">Help</a>
        </div>
      </div>
    </div>
  );
};
