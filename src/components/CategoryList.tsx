import React from 'react';
import { ChevronRight, Gamepad2, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const categories = [
  {
    title: 'Grow A Garden 2',
    subtitle: 'เกมปลูกผักสุดฮิตที่คุณไม่ควรพลาด',
    image: 'https://img2.pic.in.th/1000109799.jpg',
    icon: <Gamepad2 className="w-5 h-5 text-emerald-400" />,
    color: 'from-emerald-500/20 to-emerald-900/5',
    borderColor: 'group-hover:border-emerald-500/50',
    btnColor: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
  },
  {
    title: 'ALL STAR',
    subtitle: 'รวมตัวละครดังจากทุกมุมโลก',
    image: 'https://img2.pic.in.th/1000109801.png',
    icon: <Star className="w-5 h-5 text-blue-400" />,
    color: 'from-blue-500/20 to-blue-900/5',
    borderColor: 'group-hover:border-blue-500/50',
    btnColor: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
  },
  {
    title: 'Coming Soon',
    subtitle: 'หมวดหมู่ใหม่กำลังจะมา',
    image: 'https://img2.pic.in.th/pic/1000098251.jpg',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    color: 'from-purple-500/20 to-purple-900/5',
    borderColor: 'group-hover:border-purple-500/50',
    btnColor: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
  }
];

export const CategoryList = () => {
  return (
    <div className="max-w-7xl mx-auto mb-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight uppercase">หมวดหมู่แนะนำ</h2>
        </div>
        <button className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
          ดูทั้งหมด <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            key={index} 
            className={`group relative border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 ${category.borderColor} hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)]`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Banner Section */}
            <div className="w-full h-28 sm:h-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
            </div>

            {/* Info Section */}
            <div className="p-4 relative z-20 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    {React.cloneElement(category.icon as React.ReactElement, { className: 'w-4 h-4' })}
                    <h3 className="text-base font-black text-white tracking-wide">{category.title}</h3>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium ">{category.subtitle}</span>
                </div>
              </div>
              <button className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${category.btnColor}`}>
                เลือกหมวดหมู่นี้
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      <button className="flex w-full mt-4 justify-center sm:hidden items-center gap-1 px-4 py-2 text-sm font-bold border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
          ดูหมวดหมู่ทั้งหมด <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
