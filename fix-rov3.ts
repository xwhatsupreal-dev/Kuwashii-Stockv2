import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const rovStartIdx = content.indexOf('if (appScreen === "ROV") {');
const rovEndIdx = content.indexOf('}; // end renderAppScreen', rovStartIdx);

let rovBlock = content.substring(rovStartIdx, rovEndIdx);

// Remove AI
const aiStart = rovBlock.indexOf('{/* Kuwashii AI Shop Assistant */}');
const aiEndStr = '</section>';
const aiEnd = rovBlock.indexOf(aiEndStr, aiStart);
if (aiStart !== -1 && aiEnd !== -1) {
    rovBlock = rovBlock.substring(0, aiStart) + rovBlock.substring(aiEnd + aiEndStr.length);
}

// Remove Rarity Filters row completely or just the Selector buttons
const rarityStart = rovBlock.indexOf('{/* Rarity & Status Filter tags row */}');
// Wait, the status filter is in the same row?
const statusStart = rovBlock.indexOf('{/* In Stock Only */}', rarityStart);
if (rarityStart !== -1 && statusStart !== -1) {
    // Actually, Rarity selector div, let's remove just the Rarity Selector Buttons
    const rarityDivStart = rovBlock.indexOf('{/* Rarity Selector Buttons */}');
    const rarityDivEnd = rovBlock.indexOf('</div>', rovBlock.lastIndexOf('</motion.button>', statusStart)) + 6;
    // wait, I can just replace the whole grid section if we want
    // But let's be careful. Let's replace the whole rarity selection block HTML.
}

content = content.substring(0, rovStartIdx) + rovBlock + content.substring(rovEndIdx);
fs.writeFileSync('src/App.tsx', content);

