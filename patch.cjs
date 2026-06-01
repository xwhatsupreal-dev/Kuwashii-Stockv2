const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\{hideGlobalStats \? '\*\*\*' : \(\(\) => \{\n\s*try \{\n\s*let savedTotal = localStorage\.getItem\('KUWASHII_GLOBAL_SALES_ASTD'\)[\s\S]*?\}\)\(\)\}/, '{hideGlobalStats ? \'***\' : (Number(globalStats?.global_sales_astd || 0).toLocaleString())}');

content = content.replace(/\{hideGlobalStats \? '\*\*\*' : \(\(\) => \{\n\s*try \{\n\s*const usersStr = localStorage\.getItem\('KUWASHII_V2_USERS'\)[\s\S]*?\}\)\(\)\}/, '{hideGlobalStats ? \'***\' : (globalStats?.user_count || 0)}');

content = content.replace(/\{hideGlobalStats \? '\*\*\*' : \(\(\) => \{\n\s*try \{\n\s*let savedTotal = localStorage\.getItem\('KUWASHII_GLOBAL_REVENUE_ASTD'\)[\s\S]*?\}\)\(\)\}/, '{hideGlobalStats ? \'***\' : (Number(globalStats?.global_revenue_astd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}');

content = content.replace(/\{hideGlobalStats \? '\*\*\*' : \(\(\) => \{\n\s*try \{\n\s*let savedTotal = localStorage\.getItem\('KUWASHII_GLOBAL_FREE_CREDITS_ASTD'\)[\s\S]*?\}\)\(\)\}/, '{hideGlobalStats ? \'***\' : (Number(globalStats?.global_free_credits_astd || 0).toLocaleString())}');

content = content.replace(/const currentVal = localStorage\.getItem\('KUWASHII_GLOBAL_SALES_ASTD'\) \|\| '0';\n\s*const newVal = window\.prompt\("แก้ไขยอดขายไปแล้วทั้งหมด \(ASTD\)", currentVal\);\n\s*if \(newVal !== null && !isNaN\(parseInt\(newVal\)\)\) \{\n\s*localStorage\.setItem\('KUWASHII_GLOBAL_SALES_ASTD', parseInt\(newVal\)\.toString\(\)\);/g, `const currentVal = String(globalStats?.global_sales_astd || 0);
                       const newVal = window.prompt("แก้ไขยอดขายไปแล้วทั้งหมด (ASTD)", currentVal);
                       if (newVal !== null && !isNaN(parseInt(newVal))) {
                          await supabase.from('system_config').upsert({ id: 'main', global_sales_astd: parseInt(newVal) });`);

content = content.replace(/const currentRev = localStorage\.getItem\('KUWASHII_GLOBAL_REVENUE_ASTD'\) \|\| '0';\n\s*const newVal = window\.prompt\("แก้ไขยอดการเติมเงินรวม ASTD", currentRev\);\n\s*if \(newVal !== null && !isNaN\(parseFloat\(newVal\)\)\) \{\n\s*localStorage\.setItem\('KUWASHII_GLOBAL_REVENUE_ASTD', parseFloat\(newVal\)\.toString\(\)\);/g, `const currentRev = String(globalStats?.global_revenue_astd || 0);
                       const newVal = window.prompt("แก้ไขยอดการเติมเงินรวม ASTD", currentRev);
                       if (newVal !== null && !isNaN(parseFloat(newVal))) {
                          await supabase.from('system_config').upsert({ id: 'main', global_revenue_astd: parseFloat(newVal) });`);

content = content.replace(/const currentFree = localStorage\.getItem\('KUWASHII_GLOBAL_FREE_CREDITS_ASTD'\) \|\| '0';\n\s*const newVal = window\.prompt\("แก้ไขยอดการแจกซองรวม ASTD", currentFree\);\n\s*if \(newVal !== null && !isNaN\(parseFloat\(newVal\)\)\) \{\n\s*localStorage\.setItem\('KUWASHII_GLOBAL_FREE_CREDITS_ASTD', parseFloat\(newVal\)\.toString\(\)\);/g, `const currentFree = String(globalStats?.global_free_credits_astd || 0);
                       const newVal = window.prompt("แก้ไขยอดการแจกซองรวม ASTD", currentFree);
                       if (newVal !== null && !isNaN(parseFloat(newVal))) {
                          await supabase.from('system_config').upsert({ id: 'main', global_free_credits_astd: parseFloat(newVal) });`);

content = content.replace(/<button onClick=\{\(\) => \{/g, '<button onClick={async () => {');

// Remove remaining JSON.parse
content = content.replace(/JSON\.parse\(localStorage\.getItem\('KUWASHII_V2_USERS'\) \|\| '\{\}'\)\[currentUser\.username\]\?\.balance/g, 'currentUserData?.balance');


fs.writeFileSync('src/App.tsx', content);
