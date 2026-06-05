import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const rovStartStr = 'if (appScreen === "ROV") {';
const rovStartIdx = content.indexOf(rovStartStr);

if (rovStartIdx === -1) {
    console.error("ROV block not found");
    process.exit(1);
}

const rovEndIdx = content.indexOf('}; // end renderAppScreen', rovStartIdx);
const rovBlock = content.substring(rovStartIdx, rovEndIdx);

let newRovBlock = rovBlock;

// 1. the categories are:
const categoryBlockToReplace = "[\n                    \"all\",\n                    \"Serum\",\n                    \"Bloodline\",\n                    \"Skin\",\n                    \"Artifact\",\n                    \"Scroll/Key\",\n                    \"Perk\",\n                    \"Other\",\n                  ]";
newRovBlock = newRovBlock.replace(categoryBlockToReplace, "[\n                    \"all\",\n                    \"รหัส ROV\"\n                  ]");
// Also if it was not matching exactly:
newRovBlock = newRovBlock.replace(/\[\s*"all",\s*"Serum",\s*"Bloodline",\s*"Skin",\s*"Artifact",\s*"Scroll\/Key",\s*"Perk",\s*"Other",\s*\]/g, '["all", "รหัส ROV"]');

// 2. Remove AI section
const aiStartIdx = newRovBlock.indexOf('{/* Kuwashii AI Shop Assistant */}');
const aiSectionEndIdx = newRovBlock.indexOf('</section>', aiStartIdx) + 10;
if (aiStartIdx !== -1 && aiSectionEndIdx > 10) {
    console.log("Removing AI section in ROV block");
    newRovBlock = newRovBlock.substring(0, aiStartIdx) + newRovBlock.substring(aiSectionEndIdx);
} else {
    console.log("AI section not found in ROV block");
}

// 3. Remove Rarity Filters
const rarityStartIdx = newRovBlock.indexOf('{/* Rarity Filter */}');
const rarityEndIdx = newRovBlock.indexOf('{/* In Stock Only */}', rarityStartIdx);
if (rarityStartIdx !== -1 && rarityEndIdx !== -1) {
    console.log("Removing Rarity Filter in ROV block");
    newRovBlock = newRovBlock.substring(0, rarityStartIdx) + newRovBlock.substring(rarityEndIdx);
} else {
    console.log("Rarity Filter not found in ROV block", rarityStartIdx, rarityEndIdx);
}

// Also remove Rarity badge from item cards inside ROV block
// 4. Look for Rarity Badge inside ROV items
const badgeRegex = /\{\/\* Rarity Badge \*\/\}.*?<\/div>/is;
newRovBlock = newRovBlock.replace(badgeRegex, '');

content = content.substring(0, rovStartIdx) + newRovBlock + content.substring(rovEndIdx);

fs.writeFileSync('src/App.tsx', content);
console.log('ROV block updated');
