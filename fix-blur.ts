import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf8');

// Replace massive absolute background blurs that break iOS WebViews
c = c.replace(/blur-\[120px\]/g, 'blur-3xl');
c = c.replace(/blur-\[100px\]/g, 'blur-3xl');
c = c.replace(/blur-\[80px\]/g, 'blur-3xl');
c = c.replace(/blur-\[60px\]/g, 'blur-2xl');

fs.writeFileSync('src/App.tsx', c);
console.log('Fixed WebKit blur issues');
