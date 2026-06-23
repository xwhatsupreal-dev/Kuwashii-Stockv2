import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<div className="absolute inset-0 bg-white\n/g, '<div className="absolute inset-0 bg-white" />\n');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed syntax!');
