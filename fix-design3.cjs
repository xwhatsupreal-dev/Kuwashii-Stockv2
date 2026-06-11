const fs = require('fs');

function applyGlass(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace main wrapper backgrounds
  code = code.replace(/bg-zinc-950/g, 'bg-transparent');
  code = code.replace(/bg-zinc-900\/60 border border-white\/5/g, 'glass-panel');
  code = code.replace(/bg-zinc-900\/50 border border-zinc-800/g, 'glass-panel');
  code = code.replace(/bg-zinc-900\/50/g, 'glass-panel');
  
  // Replace card backgrounds
  code = code.replace(/bg-zinc-900\/40 border border-zinc-900\/60/g, 'glass-panel');
  code = code.replace(/bg-zinc-900 border border-zinc-800/g, 'glass-panel-light');
  code = code.replace(/bg-zinc-900\/90/g, 'glass-panel');
  code = code.replace(/bg-zinc-900/g, 'bg-white/5');
  code = code.replace(/border-zinc-800/g, 'border-white/5');
  code = code.replace(/border-zinc-900/g, 'border-white/5');

  // Specific header
  code = code.replace(/bg-zinc-950 py-7/g, 'bg-transparent py-8');
  code = code.replace(/border-b border-zinc-900/g, 'border-b border-white/5 nav-glass');
  
  // Text colors to make it cleaner
  code = code.replace(/text-zinc-500/g, 'text-zinc-400');
  
  // Rounded corners updates (makes it feel more modern)
  code = code.replace(/rounded-xl/g, 'rounded-2xl');

  fs.writeFileSync(file, code);
}

['src/App.tsx', 'src/components/ItemCard.tsx', 'src/components/AdminModal.tsx', 'src/components/InquiryModal.tsx', 'src/components/LiveActivities.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    applyGlass(file);
    console.log("Applied to " + file);
  }
});
