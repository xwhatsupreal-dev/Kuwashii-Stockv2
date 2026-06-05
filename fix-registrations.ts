import fs from 'fs';

let q = fs.readFileSync('src/queries.ts', 'utf8');
q = q.replace('{ username, password: passwordHash, balance: 0, is_admin: false }', '{ username, password: passwordHash, balance: 0, balance_rov: 0, is_admin: false }');
fs.writeFileSync('src/queries.ts', q);

let a = fs.readFileSync('src/App.tsx', 'utf8');
a = a.replace(/balance: 0/g, 'balance: 0,\n          balance_rov: 0');
fs.writeFileSync('src/App.tsx', a);

console.log('Fixed registrations');
