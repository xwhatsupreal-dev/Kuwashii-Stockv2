import fs from 'fs';

const appCode = fs.readFileSync('src/App.tsx', 'utf8');

const aotrStartString = '    return (\n      <motion.div\n        key="aotr"';
const aotrEndString = '  }; // end renderAppScreen';

const startIndex = appCode.indexOf(aotrStartString);
const endIndex = appCode.indexOf(aotrEndString);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find AOTR block bounds.');
  process.exit(1);
}

const aotrBlock = appCode.substring(startIndex, endIndex);

// Build ROV block by replacing AOTR specific text with ROV text in the ASTD style or AOTR style.
let rovBlock = aotrBlock.replace('key="aotr"', 'key="rov"');
rovBlock = rovBlock.replaceAll('AOT REVOLUTION', 'ARENA OF VALOR (ROV)');
rovBlock = rovBlock.replaceAll('AOT Revolution', 'Arena of Valor (ROV)');
rovBlock = rovBlock.replace('["all", "Serum", "Bloodline", "Skin", "Artifact", "Scroll/Key", "Perk", "Other"]', '["all", "ไอดี ROV", "คูปอง ROV", "รับปั้มแรงค์ ROV", "Other"]');
rovBlock = rovBlock.replace('["มีสินค้าตัวไหนที่คนนิยมซื้อมากที่สุดในร้านบ้าง?", "อธิบายความแตกต่างระหว่าง Serum กับ Bloodline สไตล์เกมเมอร์", "ขอไอเทมแนะนำสำหรับปักหมุดประจำวันหน่อยครับ"]', '["มีสินค้าตัวไหนที่คนนิยมซื้อมากที่สุดในร้านบ้าง?", "อธิบายความคุ้มค่าของการอุดหนุนไอดีและแรงค์ ROV", "ขอไอเดียโค้ดลับหรือโปรโมชั่นประจำสัปดาห์หน่อยครับ"]');

// Also update the condition for AOTR
const newAotrBlock = '    if (appScreen === "AOTR") {\n  ' + aotrBlock.trim().replace('return (', 'return (') + '\n    }\n\n' + '    if (appScreen === "ROV") {\n  ' + rovBlock.trim().replace('return (', 'return (') + '\n    }\n\n    return null;\n';

const newAppCode = appCode.substring(0, startIndex) + newAotrBlock + appCode.substring(endIndex);

fs.writeFileSync('src/App.tsx', newAppCode);
console.log('App.tsx updated with dedicated ROV and AOTR blocks');
