import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { supabase } from '../supabase';

interface SalesChartProps {
  appScreen?: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ appScreen }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch purchases from the last 7 days
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('created_at, price, quantity')
        .gte('created_at', sevenDaysAgo);

      if (error || !purchases) return;

      // Group by date
      const grouped = purchases.reduce((acc: any, curr: any) => {
        const date = format(new Date(curr.created_at), 'dd MMM', { locale: th });
        if (!acc[date]) {
          acc[date] = { date, sales: 0, revenue: 0 };
        }
        acc[date].sales += curr.quantity || 1;
        acc[date].revenue += Number(curr.price) || 0;
        return acc;
      }, {});

      // Generate last 7 days array to ensure empty days are shown
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, 'dd MMM', { locale: th });
        chartData.push(grouped[dateStr] || { date: dateStr, sales: 0, revenue: 0 });
      }

      setData(chartData);
    };

    fetchData();
  }, [appScreen]);

  return (
    <div className="w-full h-64 mt-4 bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
      <h3 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider font-sans">ยอดขาย 7 วันล่าสุด</h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.5rem', fontSize: '12px' }}
               itemStyle={{ color: '#818cf8' }}
            />
            <Area type="monotone" dataKey="sales" name="ยอดขาย (ชิ้น)" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
