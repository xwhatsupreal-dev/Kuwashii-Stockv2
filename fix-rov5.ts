import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const rovStartIdx = content.indexOf('if (appScreen === "ROV") {');
const rovEndIdx = content.indexOf('}; // end renderAppScreen', rovStartIdx);

let rovBlock = content.substring(rovStartIdx, rovEndIdx);

const startToRemove = rovBlock.indexOf('{/* Rarity Selector Buttons */}');
const endToRemove = rovBlock.indexOf('{/* Availability status selectors and Popular item filters */}');

if (startToRemove !== -1 && endToRemove !== -1) {
    console.log("Removing inside ROV block");
    rovBlock = rovBlock.substring(0, startToRemove) + rovBlock.substring(endToRemove);
}

// Convert the grid to 1 column
rovBlock = rovBlock.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-zinc-900">', '<div className="grid grid-cols-1 gap-5 pt-2 border-t border-zinc-900">');

content = content.substring(0, rovStartIdx) + rovBlock + content.substring(rovEndIdx);
fs.writeFileSync('src/App.tsx', content);

console.log("Fixed rarity successfully.");
