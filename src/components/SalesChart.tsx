import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { supabase } from '../supabase';

interface SalesChartProps {
  appScreen?: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ appScreen }) => {
  const [data, setData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'sales' | 'signups' | 'topups'>('sales');
  useEffect(() => {
    // Analytics graph fetches once per tab/view mode to save Egress
    const fetchData = async () => {
      const now = new Date();
      // Round down to the current exact hour to make ticks predictable
      const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const sevenDaysAgo = subDays(currentHour, 7);
      const chartDataMap: Record<string, any> = {};
      
      // Create points every 1 day
      for (let i = 0; i <= 7; i++) {
        const d = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
        const keyStr = format(d, 'yyyy-MM-dd');
        const displayStr = format(d, 'd MMM', { locale: th });
        chartDataMap[keyStr] = { 
          fullKey: keyStr, 
          date: displayStr, 
          sales: 0, 
          signups: 0, 
          topups: 0 
        };
      }

      const getNearestKey = (timestampStr: string) => {
         try {
           return format(new Date(timestampStr), 'yyyy-MM-dd');
         } catch {
           return '';
         }
      };

      if (viewMode === 'sales') {
        const { data: purchases, error } = await supabase
          .from('purchases')
          .select('created_at, price, quantity')
          .gte('created_at', sevenDaysAgo.toISOString());

        if (!error && purchases) {
          purchases.forEach((curr: any) => {
            const key = getNearestKey(curr.created_at);
            if (chartDataMap[key]) {
              chartDataMap[key].sales += curr.quantity || 1;
            }
          });
        }
      } else if (viewMode === 'signups') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', sevenDaysAgo.toISOString());
          
        if (!error && profiles) {
          profiles.forEach((curr: any) => {
            const key = getNearestKey(curr.created_at);
            if (chartDataMap[key]) {
              chartDataMap[key].signups += 1;
            }
          });
        }
      } else if (viewMode === 'topups') {
        let query = supabase
          .from('topups')
          .select('created_at, amount, game')
          .gte('created_at', sevenDaysAgo.toISOString());

        const { data: topups, error } = await query;
          
        if (!error && topups) {
          topups.forEach((curr: any) => {
            // Filter by game
            if (appScreen === 'ASTD' && curr.game && curr.game !== 'ASTD') return;
            if (appScreen === 'AOTR' && curr.game !== 'AOTR') return;

            const key = getNearestKey(curr.created_at);
            if (chartDataMap[key]) {
               chartDataMap[key].topups += Number(curr.amount) || 0;
            }
          });
        }
      }

      const rawData = Object.values(chartDataMap).sort((a,b) => new Date(a.fullKey).getTime() - new Date(b.fullKey).getTime());
      setData(rawData);
    };

    fetchData();
  }, [viewMode, appScreen]);

  const getColor = () => {
    if (viewMode === 'sales') return '#818cf8';
    if (viewMode === 'signups') return '#34d399';
    if (viewMode === 'topups') return '#fbbf24';
    return '#818cf8';
  };

  const getLabel = () => {
     if (viewMode === 'sales') return 'ยอดขาย (ชิ้น)';
     if (viewMode === 'signups') return 'สมัครใหม่ (คน)';
     if (viewMode === 'topups') return 'ยอดเติม (บาท)';
     return '';
  };

  return (
    <div className="w-full h-auto mt-4 bg-zinc-900 border border-zinc-900/60 p-4 rounded-xl flex flex-col font-sans relative z-10 box-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">สถิติ 7 วันล่าสุด</h3>
        
        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-900 self-start">
          <motion.button whileTap={{ scale: 0.95 }} 
            onClick={() => setViewMode('sales')}
            className={`text-[10px] px-3 py-1.5 rounded-md transition-all ${viewMode === 'sales' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ยอดขาย
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} 
            onClick={() => setViewMode('signups')}
            className={`text-[10px] px-3 py-1.5 rounded-md transition-all ${viewMode === 'signups' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            สมัครสมาชิก
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} 
            onClick={() => setViewMode('topups')}
            className={`text-[10px] px-3 py-1.5 rounded-md transition-all ${viewMode === 'topups' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
             ยอดเติมเงิน
          </motion.button>
        </div>
      </div>
      
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          {/* @ts-ignore */}
          <BarChart key={viewMode} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getColor()} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={getColor()} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
               dataKey="date" 
               stroke="#52525b" 
               fontSize={10} 
               tickLine={false} 
               axisLine={false} 
               interval={0}
            />
            <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.5rem', fontSize: '12px' }}
               itemStyle={{ color: getColor() }}
               cursor={{ fill: '#27272a', opacity: 0.4 }}
               isAnimationActive={true}
               animationDuration={300}
               animationEasing="ease-out"
               labelFormatter={(labelLabel) => {
                 try {
                   // `date` doesn't contain a real parsable date easily in `labelLabel` which is like "2 มิ.ย."
                   return `วันที่ ${labelLabel}`;
                 } catch (e) {
                   return labelLabel;
                 }
               }}
            />
            <Bar dataKey={viewMode} name={getLabel()} fill="url(#colorMetric)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
