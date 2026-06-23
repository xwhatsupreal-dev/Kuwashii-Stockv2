import React from 'react';
import { motion } from 'motion/react';
import { Package, Clock } from 'lucide-react';

export const ItemCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-zinc-950 min-h-[460px] animate-pulse relative"
    >
      {/* Background radial gradient representing skeleton vibe */}
      <div className="absolute top-0 left-0 right-0 aspect-square bg-gradient-to-b from-zinc-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Top Banner & Badges */}
      <div className="p-3 sm:p-4 pb-1.5 sm:pb-2">
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          {/* Category Placeholder */}
          <div className="h-5 w-16 bg-zinc-900 rounded-md border border-white/5" />

          {/* Rarity Placeholder */}
          <div className="h-5 w-24 bg-zinc-900 rounded-md border border-white/5" />
        </div>

        {/* Item Image Box */}
        <div className="relative w-full aspect-square rounded-xl bg-zinc-900 border border-white/5 mb-3 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 mb-2">
            <Package className="w-5 h-5 text-zinc-700" />
          </div>
          <div className="h-2 w-20 bg-zinc-900 rounded-md" />

          {/* Price Tag Overlay Placeholder */}
          <div className="absolute bottom-2 right-2 bg-zinc-950 py-1 px-2.5 rounded-lg border border-white/5">
            <div className="h-3 w-12 bg-zinc-900 rounded" />
          </div>

          {/* Stock Availability Indicator Placeholder */}
          <div className="absolute top-2 left-2 bg-zinc-950 py-1 px-2 rounded-md border border-white/5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <div className="h-2.5 w-10 bg-zinc-900 rounded" />
          </div>
        </div>

        {/* Name Title Placeholder */}
        <div className="h-5 w-2/3 bg-zinc-900 rounded-md mb-2.5" />

        {/* Description Placeholder */}
        <div className="space-y-1.5 mb-3.5">
          <div className="h-3 w-full bg-zinc-900 rounded" />
          <div className="h-3 w-5/6 bg-zinc-900 rounded" />
        </div>

        {/* Info Grid / Stock Meter Placeholder */}
        <div className="space-y-3.5 bg-zinc-900 p-2.5 rounded-xl border border-white/5 text-[10px] font-sans">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-16 bg-zinc-900 rounded" />
            <div className="h-3.5 w-14 bg-zinc-900 rounded" />
          </div>

          {/* Progress bar visual */}
          <div className="space-y-1.5 pt-0.5">
            <div className="w-full bg-zinc-950 h-1.5 rounded-full p-0.5 flex items-center border border-white/5">
              <div className="h-0.5 bg-zinc-900 rounded-full w-2/3" />
            </div>
            <div className="flex justify-between">
              <div className="h-2.5 w-16 bg-zinc-900 rounded" />
              <div className="h-2.5 w-6 bg-zinc-900 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Section */}
      <div className="p-3 sm:p-4 pt-0">
        <div className="mt-2.5 space-y-2">
          {/* Core active inquiry button placeholder */}
          <div className="h-8 bg-zinc-900 rounded-xl w-full border border-white/5" />
          
          {/* AI discussion tag button placeholder */}
          <div className="h-7 bg-zinc-900 rounded-xl w-full border border-white/5" />
        </div>

        {/* Timestamp footer placeholder */}
        <div className="mt-3.5 flex items-center justify-between border-t border-zinc-900/60 pt-2 text-[9px] text-zinc-700">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <div className="h-2.5 w-16 bg-zinc-900 rounded" />
          </span>
          <div className="h-2.5 w-12 bg-zinc-900 rounded" />
        </div>
      </div>
    </motion.div>
  );
};
