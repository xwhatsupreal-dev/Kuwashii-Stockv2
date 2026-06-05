import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const rovStartIdx = content.indexOf('if (appScreen === "ROV") {');
const rovEndIdx = content.indexOf('}; // end renderAppScreen', rovStartIdx);

let rovBlock = content.substring(rovStartIdx, rovEndIdx);

rovBlock = rovBlock.replace('onShareToAI={handleShareToAI}', '');

content = content.substring(0, rovStartIdx) + rovBlock + content.substring(rovEndIdx);

fs.writeFileSync('src/App.tsx', content);

