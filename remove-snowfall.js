import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/<Snowfall \/>/g, '');
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Removed Snowfall');
