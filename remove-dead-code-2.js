import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The select block
content = content.replace(/if\s*\(false\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="select"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');

// The loading block
content = content.replace(/if\s*\(false\s*\|\|\s*false\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="loading"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');
content = content.replace(/if\s*\(appScreen\s*===\s*"LOADING"\s*\|\|\s*appScreen\s*===\s*"TRANSITION"\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="loading"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');
content = content.replace(/if\s*\(false\)\s*\{\s*return\s*\(\s*<motion\.div\s*key="loading"[\s\S]*?<\/motion\.div>\s*\);\s*\}/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Select and Loading blocks removed!');
