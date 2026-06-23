import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Combine items and remove game match filter
content = content.replace(/const matchesGame = item\.game === appScreen;/g, 'const matchesGame = true;');

// Filter out AOTR and ROV sections and make ASTD the main SHOP rendering
// since appScreen === "SHOP" is now the only true section (formerly ASTD).

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Filters updated!');
