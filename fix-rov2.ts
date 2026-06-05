import fs from 'fs';

const fileStr = fs.readFileSync('src/App.tsx', 'utf8');

// The ROV block starts around line 5685: `if (appScreen === "ROV") {`

let startIndex = fileStr.indexOf('if (appScreen === "ROV") {');
if (startIndex === -1) {
  console.log("Could not find ROV block");
  process.exit(1);
}

let endIndex = fileStr.indexOf('}; // end renderAppScreen', startIndex);
if (endIndex === -1) {
  endIndex = fileStr.indexOf('return null;\n  };\n', startIndex);
}

const rovStr = fileStr.substring(startIndex, endIndex);

let newRovStr = rovStr;

// 1. Remove AI:
const aiStart = newRovStr.indexOf('          {/* Kuwashii AI Shop Assistant */}');
const searchSectionStart = newRovStr.indexOf('          {/* Main Content Toolbars */}', aiStart);
if (aiStart !== -1 && searchSectionStart !== -1) {
  console.log("Removing AI section");
  newRovStr = newRovStr.substring(0, aiStart) + newRovStr.substring(searchSectionStart);
} else {
  console.log('AI Section not found properly', aiStart, searchSectionStart);
}

// 2. Modify Categories:
// Looking for: 
/*
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
                {(
                  [
                    "all",
                    "ไอดี ROV",
                    "คูปอง ROV",
                    "รับปั้มแรงค์ ROV",
                    "Other",
                  ] as const
                ).map((cat) => (
*/
const catRegex = /\{\(\s*\[\s*"all"[\s\S]*?\](?: as const)?\s*\).map\(\(cat\) =>/g;
// actually it's easier to just specify it directly by string if we know the content
// because we already replaced it in a previous step to:
// "all", "ไอดี ROV", "คูปอง ROV", "รับปั้มแรงค์ ROV", "Other"
const catArrayRegexStr = /\[\s*"all",\s*"ไอดี ROV",\s*"คูปอง ROV",\s*"รับปั้มแรงค์ ROV",\s*"Other"\s*\]/g;
if (catArrayRegexStr.test(newRovStr)) {
    console.log("Replacing category array 1");
    newRovStr = newRovStr.replace(catArrayRegexStr, '["all", "รหัส ROV"]');
}

// 3. Remove Rarity block inside ROV
// Look for Rarity section:
const rarRegex = /\{\/\* Rarity Filter \*\/\}.*?(?:<\/div>\s*<\/div>\s*<\/div>)/is;
const rarityStart = newRovStr.indexOf('{/* Rarity Filter */}');
if (rarityStart !== -1) {
   // find the next section or end of div
   const stockLabelIndex = newRovStr.indexOf('{/* In Stock Only */}', rarityStart);
   if (stockLabelIndex !== -1) {
      console.log('Removing Rarity filter section');
      let precedingDivEnd = newRovStr.lastIndexOf('</div>', stockLabelIndex); 
      // This is a bit risky, let's find the exact block using string manipulation
      let match = newRovStr.substring(rarityStart, stockLabelIndex);
      newRovStr = newRovStr.replace(match, '');
   }
}

// What about Item Rarity badges in the render array of items?
// the item render in ROV uses the same `currentContextItems.map(...)` code. Wait, does ROV use `currentContextItems`?
// Yes, currentContextItems contains all items filtered.
// Wait, the item cards display Rarity. Let's look for item Rarity display in ROV.
const rarityBadgeStart = newRovStr.indexOf('className={`px-2 py-[2px] rounded uppercase text-[9px] font-black tracking-widest border shadow-sm flex items-center gap-1 backdrop-blur-sm');
// Wait, the item card is generated inside `currentContextItems.map`.
const finalContent = fileStr.substring(0, startIndex) + newRovStr + fileStr.substring(endIndex);

fs.writeFileSync('src/App.tsx', finalContent);
console.log('Processed ROV section');
