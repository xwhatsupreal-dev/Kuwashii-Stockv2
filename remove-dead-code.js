import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove unreachable AOTR rendering block
content = content.replace(/if\s*\(false\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="aotr"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');

// Remove unreachable ROV rendering block
content = content.replace(/if\s*\(false\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="rov"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');

// The "SELECT" block might still be there as `if (false) { return ... SELECT ... }`
content = content.replace(/if\s*\(false\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="select"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');

// Remove LOADING block
content = content.replace(/if\s*\(false\s*\|\|\s*false\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="loading"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');

// Fix up the main ASTD block to not need `if (appScreen === "SHOP")` wrapper, actually it's fine
// I'll just write it back.
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Unreachable blocks removed!');
