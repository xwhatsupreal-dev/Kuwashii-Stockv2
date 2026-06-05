import fs from 'fs';

let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');

// Hide the rarity select
const rarityStart = content.indexOf('{/* Rarity Select */}');
const quantityStart = content.indexOf('<div>\n                <label className="text-xs font-bold uppercase tracking-wider', rarityStart);

if (rarityStart !== -1 && quantityStart !== -1) {
    const rarityDiv = content.substring(rarityStart, quantityStart);
    // Wrap it in a conditional
    const replacement = `{currentGame !== 'ROV' && (\n              <div className="mb-4">\n${rarityDiv.replace('<div>', '<div>')}\n              </div>\n            )}\n            `;
    content = content.substring(0, rarityStart) + replacement + content.substring(quantityStart);
}

fs.writeFileSync('src/components/AdminModal.tsx', content);
