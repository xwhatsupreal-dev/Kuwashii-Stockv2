import fs from 'fs';

function replaceClassNames(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Colors & Backgrounds
  content = content.replace(/text-white/g, 'text-slate-900');
  content = content.replace(/text-zinc-100/g, 'text-slate-800');
  content = content.replace(/text-zinc-200/g, 'text-slate-700');
  content = content.replace(/text-zinc-300/g, 'text-slate-600');
  content = content.replace(/text-zinc-400/g, 'text-slate-500');
  content = content.replace(/text-zinc-500/g, 'text-slate-400');
  content = content.replace(/text-zinc-650/g, 'text-slate-400');
  content = content.replace(/text-zinc-750/g, 'text-slate-300');
  content = content.replace(/bg-zinc-900/g, 'bg-white');
  content = content.replace(/bg-zinc-950/g, 'bg-slate-50');
  content = content.replace(/bg-zinc-800\/[0-9]+/g, 'bg-slate-100');
  content = content.replace(/bg-black\/[0-9]+/g, 'bg-white/90');
  content = content.replace(/bg-white\/[0-9]+/g, 'bg-slate-100');
  content = content.replace(/border-white\/[0-9]+/g, 'border-slate-200');
  content = content.replace(/border-white\/5\/80/g, 'border-slate-200');
  content = content.replace(/border-white\/5\/60/g, 'border-slate-200');
  content = content.replace(/border-zinc-800/g, 'border-slate-300');
  content = content.replace(/border-zinc-700/g, 'border-slate-300');
  content = content.replace(/border-zinc-850/g, 'border-slate-300');
  
  // Custom panels
  content = content.replace(/glass-panel-light/g, 'bg-slate-50 border border-slate-200');
  content = content.replace(/glass-panel/g, 'bg-white shadow-sm border border-slate-200');
  
  // Gradients
  content = content.replace(/bg-gradient-to-(r|br|bl|l|t|b) from-zinc-950.*/g, 'bg-white');
  content = content.replace(/from-zinc-950\/90/g, 'from-white/90');
  content = content.replace(/from-indigo-950\/20/g, 'from-blue-50');
  content = content.replace(/via-zinc-900\/50/g, 'via-white');
  content = content.replace(/to-zinc-900\/20/g, 'to-white');
  content = content.replace(/from-red-950\/20/g, 'from-red-50');
  content = content.replace(/from-amber-600\/5/g, 'from-amber-100/50');
  content = content.replace(/from-indigo-600\/5/g, 'from-blue-100/50');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceClassNames('src/App.tsx');
replaceClassNames('src/components/ItemCard.tsx');

console.log('Done!');
