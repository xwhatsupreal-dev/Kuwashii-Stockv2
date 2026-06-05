import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const rovStartIdx = content.indexOf('if (appScreen === "ROV") {');
const rovEndIdx = content.indexOf('}; // end renderAppScreen', rovStartIdx);

let rovBlock = content.substring(rovStartIdx, rovEndIdx);

// 1. Remove Rarity block inside ROV
const rarityStart = rovBlock.indexOf('{/* Rarity Selector Buttons */}');
const rarityEnd = rovBlock.indexOf('              {/* Availability status selectors and Popular item filters */}');
if (rarityStart !== -1 && rarityEnd !== -1) {
    rovBlock = rovBlock.substring(0, rarityStart) + rovBlock.substring(rarityEnd);
}

// Also replace `md:grid-cols-2` with `md:grid-cols-1` for that row
const gridRowStr = '<div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-zinc-900">';
rovBlock = rovBlock.replace(gridRowStr, '<div className="grid grid-cols-1 md:grid-cols-1 gap-5 pt-2 border-t border-zinc-900">');

content = content.substring(0, rovStartIdx) + rovBlock + content.substring(rovEndIdx);
fs.writeFileSync('src/App.tsx', content);
console.log('Done Rarity');
