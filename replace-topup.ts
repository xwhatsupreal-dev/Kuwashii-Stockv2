import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/setShowTopupModal\(true\)/g, "appScreen === 'ROV' ? showToast('ระบบเติมเงิน ROV จะเปิดให้บริการเร็วๆ นี้', 'info') : setShowTopupModal(true)");

fs.writeFileSync('src/App.tsx', content);
console.log('Done replacing topup modal triggers.');
