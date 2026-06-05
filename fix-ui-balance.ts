import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/currentUserData\?\.balance/g, "(appScreen === 'ROV' ? currentUserData?.balance_rov : currentUserData?.balance)");

content = content.replace(/liveUser\.balance \|\| 0/g, "(liveUser[appScreen === 'ROV' ? 'balance_rov' : 'balance'] || 0)");

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed UI variables');
