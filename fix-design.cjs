const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Update summary card styles for better readability and cleaner look
app = app.replace(/bg-zinc-900\/40 border border-zinc-900\/60 p-4 rounded-xl/g, 'bg-zinc-900/60 border border-white/5 p-5 rounded-2xl shadow-sm backdrop-blur-sm');

// Update small text in summary titles to text-xs and slightly brighter
app = app.replace(/text-\[10px\] font-bold text-zinc-500 uppercase tracking-widest font-sans/g, 'text-xs font-bold text-zinc-400 uppercase tracking-wider font-sans');

// Update text sizes in some buttons for clarity
app = app.replace(/text-\[10px\]/g, 'text-[11px]'); // slightly larger

// Fix main SELECT page cards
app = app.replace(/border-zinc-800 bg-zinc-900\/50 p-3/g, 'border-white/5 bg-zinc-900/60 p-3 shadow-2xl backdrop-blur-md');

fs.writeFileSync('src/App.tsx', app);

let itemCard = fs.readFileSync('src/components/ItemCard.tsx', 'utf-8');
// Clean up ItemCard borders
itemCard = itemCard.replace(/border-zinc-800\/70/g, 'border-white/5');
itemCard = itemCard.replace(/border-zinc-800\/50/g, 'border-white/5');
itemCard = itemCard.replace(/border-zinc-900\/80/g, 'border-white/5');
itemCard = itemCard.replace(/border-zinc-950/g, 'border-white/5');
itemCard = itemCard.replace(/bg-zinc-900\/40/g, 'bg-zinc-900/50 backdrop-blur-sm');

// make the name more readable if it was too thin
itemCard = itemCard.replace(/text-sm font-bold/g, 'text-[15px] font-bold tracking-tight');
// Make smaller info text clearer
itemCard = itemCard.replace(/text-\[10px\]/g, 'text-[11px]');

fs.writeFileSync('src/components/ItemCard.tsx', itemCard);

console.log("Done upgrading design.");
