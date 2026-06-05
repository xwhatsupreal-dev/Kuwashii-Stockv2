import fs from 'fs';

let content = fs.readFileSync('src/components/CustomerDatabaseModal.tsx', 'utf8');

// Update mappings
content = content.replace(/balance: Number\(d\.balance\),/g, "balance: Number(d.balance),\n          balance_rov: Number(d.balance_rov),");

// Update edit handler
content = content.replace(/const oldBalance = user\.balance \|\| 0;/g, "const balanceField = appScreen === 'ROV' ? 'balance_rov' : 'balance';\n      const oldBalance = user[balanceField] || 0;");
content = content.replace(/\.update\(\{ balance: amount \}\)/g, ".update({ [balanceField]: amount })");
content = content.replace(/\{ \.\.\.u, balance: amount \}/g, "{ ...u, [balanceField]: amount }");
content = content.replace(/appScreen === 'ASTD' \? 'ASTD' : 'AOTR'/g, "appScreen");

// Update UI display
content = content.replace(/\(user\.balance \|\| 0\)\.toLocaleString/g, "((appScreen === 'ROV' ? user.balance_rov : user.balance) || 0).toLocaleString");
content = content.replace(/setNewBalance\(String\(user\.balance \|\| 0\)\)/g, "setNewBalance(String((appScreen === 'ROV' ? user.balance_rov : user.balance) || 0))");

fs.writeFileSync('src/components/CustomerDatabaseModal.tsx', content);
console.log('Fixed Customer Modal');
