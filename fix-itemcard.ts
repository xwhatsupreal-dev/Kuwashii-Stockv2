import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all <ItemCard with <ItemCard appScreen={appScreen}
// Only if it doesn't already have appScreen={appScreen}
content = content.replace(/<ItemCard\n/g, '<ItemCard\n                    appScreen={appScreen}\n');

fs.writeFileSync('src/App.tsx', content);
console.log('Done ItemCard props');
