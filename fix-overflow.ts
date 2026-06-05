import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/relative overflow-x-hidden/g, 'relative w-full');
// remove it from the other classes as well
c = c.replace(/overflow-x-hidden /g, '');
fs.writeFileSync('src/App.tsx', c);
console.log('Fixed overflow-x-hidden');
