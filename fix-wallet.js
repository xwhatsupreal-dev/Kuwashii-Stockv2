import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/ระบบกระเป๋าเงินถูกแยกตามเกมที่ท่านกำลังให้ความสนใจ <b[^>]*>\([^)]+\)<\/b><br\/>/g, 'ระบบกระเป๋าเงินของคุณสามารถใช้งานได้ทุกบริการ<br/>');
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed wallet text');
