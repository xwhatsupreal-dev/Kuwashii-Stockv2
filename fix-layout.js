import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
content = content.replace(/import Snowfall from "\.\/components\/Snowfall";/g, 'import Snowfall from "./components/Snowfall";\nimport { ShopHeader } from "./components/ShopHeader";\nimport { ShopBanner } from "./components/ShopBanner";');

// In modern React, the user might want this completely clean UI for all 3 apps since they are essentially the same just filtered.
// For now, let's just replace the `<header className="relative border-b...` through `</header>` block with `<ShopBanner globalStats={globalStats} />` ?
// Wait, the new ShopHeader requires sidebar/search etc handlers. It should be outside the <main> block, while ShopBanner inside.
// Actually, App.tsx has:
// <div className="absolute top-0 right-0 p-4 sm:p-6 z-[100] flex flex-col items-end gap-2 text-right"> ... user menu ... </div>
// and then the main container. I'll just change the `<header...` to `<ShopBanner globalStats={globalStats} />`.

const headerRegex = /<header className="relative border-b border-slate-200[\s\S]*?<\/header>/g;

content = content.replace(headerRegex, '<ShopBanner globalStats={globalStats} />');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Main Layout updated!');
