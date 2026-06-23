import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const Statement = ({ currentUser, onLoginClick }: { currentUser: any, onLoginClick: () => void }) => {
  const [userData, setUserData] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const { data: user } = await supabase.from('profiles').select('*').eq('username', currentUser.username).single();
      const { data: purs } = await supabase.from('purchases').select('*').eq('username', currentUser.username).order('created_at', { ascending: false });
      const { data: tops } = await supabase.from('topups').select('*').eq('username', currentUser.username).order('created_at', { ascending: false });
      setUserData(user);
      if (purs) setPurchases(purs);
      if (tops) setTopups(tops);
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white text-center">เข้าสู่ระบบเพื่อดู Statement</h2>
        <p className="text-zinc-400 text-center max-w-sm">คุณจำเป็นต้องเข้าสู่ระบบก่อนเพื่อดูยอดเงินคงเหลือและประวัติการทำรายการของคุณ</p>
        <button 
          onClick={onLoginClick}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalTopup = topups.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 flex flex-col pt-10">
      <h2 className="text-2xl font-black text-white px-2">สรุปรายการ Statement</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-zinc-400 text-sm font-medium mb-1">ยอดเงินคงเหลือ</p>
            <h3 className="text-3xl font-black text-blue-400">฿{userData?.balance?.toFixed(2) || '0.00'}</h3>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-24 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm font-medium mb-1">ยอดเติมเงินสะสม</p>
          <h3 className="text-2xl font-bold text-emerald-400">฿{totalTopup.toFixed(2)}</h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm font-medium mb-1">ยอดใช้จ่ายสะสม</p>
          <h3 className="text-2xl font-bold text-rose-400">฿{totalSpent.toFixed(2)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ประวัติการเติมเงินล่าสุด
            </h3>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{topups.length} รายการ</span>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {topups.length > 0 ? topups.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-emerald-400">+{t.amount} บาท</p>
                  <p className="text-xs text-zinc-500">{new Date(t.created_at).toLocaleString()}</p>
                </div>
                <div className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  {t.method || t.gateway || 'เติมเงิน'}
                </div>
              </div>
            )) : (
              <p className="text-center text-zinc-500 text-sm py-10">ไม่มีประวัติการเติมเงิน</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              ประวัติการซื้อสินค้าล่าสุด
            </h3>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{purchases.length} รายการ</span>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {purchases.length > 0 ? purchases.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-xl">
                <div className="truncate pr-4 flex-1">
                  <p className="text-sm font-bold text-zinc-200 truncate">{p.item_name}</p>
                  <p className="text-xs text-zinc-500">{new Date(p.created_at).toLocaleString()}</p>
                </div>
                <div className="shrink-0 text-right pl-2">
                  <p className="text-sm font-bold text-rose-400">-{p.price} บาท</p>
                  {(p.quantity > 1 || p.qty > 1) && <p className="text-xs text-zinc-500">จำนวน: {p.quantity || p.qty}</p>}
                </div>
              </div>
            )) : (
              <p className="text-center text-zinc-500 text-sm py-10">ไม่มีประวัติการสั่งซื้อ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
