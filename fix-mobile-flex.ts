import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr1 = `<span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hidden sm:flex">\n                            <Coins className="w-3.5 h-3.5" />`;

const newStr1 = `<span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">\n                            <Coins className="w-3.5 h-3.5" />`;

const oldStr2 = `<span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hidden sm:flex">\n                        <Coins className="w-3.5 h-3.5" />`;

const newStr2 = `<span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">\n                        <Coins className="w-3.5 h-3.5" />`;

content = content.replace(oldStr1, newStr1);
content = content.replace(oldStr2, newStr2);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed mobile hidden flex");
