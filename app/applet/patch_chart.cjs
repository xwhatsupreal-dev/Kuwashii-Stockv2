const fs = require('fs');
const content = `import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    const fetchData = async () => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const chartDataMap: Record<string, any> = {};
      
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, 'dd MMM', { locale: th });
        chartDataMap[dateStr] = { date: dateStr, sales: 0, signups: 0, topups: 0 };
      }

      if (viewMode === 'sales') {
        const { data: purchases, error } = await supabase
          .from('purchases')
          .select('created_at, price, quantity')
          .gte('created_at', sevenDaysAgo);

        if (!error && purchases) {
          purchases.forEach((curr: any) => {
            const date = format(new Date(curr.created_at), 'dd MMM', { locale: th });
            if (chartDataMap[date]) {
              chartDataMap[date].sales += curr.quantity || 1;
            }
          });
        }
      } else if (viewMode === 'signups') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', sevenDaysAgo);
          
        if (!error && profiles) {
          profiles.forEach((curr: any) => {
            const date = format(new Date(curr.created_at), 'dd MMM', { locale: th });
            if (chartDataMap[date]) {
              chartDataMap[date].signups += 1;
            }
          });
        }
      } else if (viewMode === 'topups') {
        const { data: topups, error } = await supabase
          .from('topups')
          .select('created_at, amount')
          .gte('created_at', sevenDaysAgo);
          
        if (!error && topups) {
          topups.forEach((curr: any) => {
            const date = format(new Date(curr.created_at), 'dd MMM', { locale: th });
            if (chartDataMap[date]) {
               chartDataMap[date].topups += Number(curr.amount) || 0;
            }
          });
        }
      }

      setData(Object.values(chartDataMap));
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
     if (viewMode === 'topups') return 'รายได้ (บาท)';
     return '';
  };

  return (
    <div className="w-full h-auto mt-4 bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl flex flex-col font-sans relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">สถิติ 7 วันล่าสุด</h3>
        
        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-900 self-start">
          <button 
            onClick={() => setViewMode('sales')}
            className={\`text-[10px] px-3 py-1.5 rounded-md transition-all \${viewMode === 'sales' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}\`}
          >
            ยอดขาย
          </button>
          <button 
            onClick={() => setViewMode('signups')}
            className={\`text-[10px] px-3 py-1.5 rounded-md transition-all \${viewMode === 'signups' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}\`}
          >
            สมัครสมาชิก
          </button>
          <button 
            onClick={() => setViewMode('topups')}
            className={\`text-[10px] px-3 py-1.5 rounded-md transition-all \${viewMode === 'topups' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}\`}
          >
             ยอดเติมเงิน
          </button>
        </div>
      </div>
      
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart key={viewMode} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getColor()} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={getColor()} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => \`\${value}\`} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.5rem', fontSize: '12px' }}
               itemStyle={{ color: getColor() }}
               cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area type="monotone" dataKey={viewMode} name={getLabel()} stroke={getColor()} strokeWidth={2} fillOpacity={1} fill="url(#colorMetric)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('src/components/SalesChart.tsx', content);
console.log("Updated SalesChart.tsx");
