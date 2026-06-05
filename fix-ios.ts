import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/min-h-\[100dvh\]/g, 'min-h-[100vh] min-h-[100dvh]');
fs.writeFileSync('src/App.tsx', content);
console.log('Done');
