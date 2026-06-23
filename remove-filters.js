import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const sectionRegex = /\{\/\* Search and Filters Hub \*\/\}\n\s*<section className="bg-slate-100\/20 border border-slate-200 p-3 sm:p-5 rounded-2xl sm:rounded-2xl mb-6 space-y-3 sm:space-y-4">[\s\S]*?<\/section>\n/g;

content = content.replace(sectionRegex, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Filters removed!');
