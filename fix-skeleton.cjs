const fs = require('fs');
let code = fs.readFileSync('src/components/ItemCardSkeleton.tsx', 'utf-8');

code = code.replace(/bg-zinc-950\/80/g, 'bg-zinc-950');
code = code.replace(/border-zinc-900\/80/g, 'border-white/5');
code = code.replace(/border-zinc-800\/40/g, 'border-white/5');
code = code.replace(/border-zinc-800\/50/g, 'border-white/5');
code = code.replace(/border-zinc-800\/30/g, 'border-white/5');
code = code.replace(/border-zinc-800\/35/g, 'border-white/5');
code = code.replace(/border-zinc-900\/50/g, 'border-white/5');
code = code.replace(/border-zinc-900\/40/g, 'border-white/5');
code = code.replace(/border-zinc-900\/30/g, 'border-white/5');

fs.writeFileSync('src/components/ItemCardSkeleton.tsx', code);
console.log("Updated Skeleton borders.");
