import fs from 'fs';

let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');

// replace category selection array
content = content.replace(/'ไอดี ROV', 'คูปอง ROV', 'รับปั้มแรงค์ ROV', 'Other'/g, "'รหัส ROV'");

// replace checking `category === 'ไอดี ROV'`
content = content.replace(/category === 'ไอดี ROV'/g, "category === 'รหัส ROV' || category === 'ไอดี ROV'");

fs.writeFileSync('src/components/AdminModal.tsx', content);
console.log('AdminModal ROV tags updated');
