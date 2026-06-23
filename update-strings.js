import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace "ค้นหาสินค้า ASTD..."
content = content.replace(/ค้นหาสินค้า ASTD\.\.\./g, 'ค้นหาสินค้า...');
content = content.replace(/แผงจัดการสต๊อก ASTD/g, 'แผงจัดการสต๊อก');
content = content.replace(/เพิ่มสินค้า ASTD/g, 'เพิ่มสินค้า');
content = content.replace(/ไม่พบสินค้าในสต๊อก ASTD/g, 'ไม่พบสินค้าในสต๊อก');
content = content.replace(/สินค้า ASTD โดย Dazz kar/g, '');
content = content.replace(/บอร์ดข้อมูลร้านค้า ASTD/g, 'บอร์ดข้อมูลร้านค้า');

// Replace default categories with generic ones for cloudphone
const newCategories = `
              "Ugphone",
              "Redfinger",
              "Ldcloud",
              "Other services",
              "VIP Codes"
`;
content = content.replace(/appScreen === "SHOP"\s*\?\s*\[\s*"สุ่มตัวละคร - ออสตา"[\s\S]*?"Other",\s*\]/g, 'true ? [\n' + newCategories + '\n]');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('UI strings updated!');
