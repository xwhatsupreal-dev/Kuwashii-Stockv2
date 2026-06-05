import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Coupons / Angpao / Slip use something like:
// const newBalance = Number(liveUser.balance) + coupon.amount;
// await supabase
//   .from("profiles")
//   .update({ balance: newBalance })
//   .eq("username", activeUsername);

const topupRegex = /const newBalance = Number\(liveUser\.balance\) \+ ([a-zA-Z0-parseFloat.]+);\n(.*?)await supabase[\s\S]*?\.from\("profiles"\)[\s\S]*?\.update\(\{ balance: newBalance \}\)/g;

content = content.replace(topupRegex, function(match, amountMatched, indent) {
  return `const balanceField = appScreen === "ROV" ? "balance_rov" : "balance";
${indent}const userBalance = Number(liveUser[balanceField] || 0);
${indent}const newBalance = userBalance + ${amountMatched};
${indent}await supabase
${indent}  .from("profiles")
${indent}  .update({ [balanceField]: newBalance })`;
});

const purchaseRegex = /const newBalance = Number\(liveUser\.balance\) \- totalPrice;\n(.*?)await supabase[\s\S]*?\.from\("profiles"\)[\s\S]*?\.update\(\{ balance: newBalance \}\)/g;

content = content.replace(purchaseRegex, function(match, indent) {
  return `const newBalance = liveUserBalance - totalPrice;
${indent}await supabase
${indent}  .from("profiles")
${indent}  .update({ [balanceField]: newBalance })`;
});

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed handlers with robust regex');

