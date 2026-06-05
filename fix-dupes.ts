import fs from 'fs';

const components = [
  'AnnouncementManagerModal.tsx',
  'AnnouncementPopup.tsx',
  'CouponManagerModal.tsx',
  'CustomerDatabaseModal.tsx',
  'GachaResultModal.tsx',
  'HistoryModal.tsx',
  'InquiryModal.tsx',
  'RandomBoxModal.tsx',
  'StockManagerModal.tsx'
];

for (const name of components) {
  const path = 'src/components/' + name;
  let text = fs.readFileSync(path, 'utf8');
  if (text.startsWith("import { motion } from 'motion/react';\n")) {
    text = text.substring("import { motion } from 'motion/react';\n".length);
    fs.writeFileSync(path, text);
    console.log('Fixed', path);
  }
}
