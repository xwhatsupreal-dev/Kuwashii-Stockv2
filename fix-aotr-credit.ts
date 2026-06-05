import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                    {!isAdmin && (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hidden sm:flex">
                        <Coins className="w-3.5 h-3.5" />
                        <span>
                          เครดิต: ฿
                          {Number((appScreen === 'ROV' ? currentUserData?.balance_rov : currentUserData?.balance) || 0).toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 0,
                            },
                          )}
                        </span>
                      </span>
                    )}`;

if (content.includes(target)) {
  content = content.replace(target, '');
  fs.writeFileSync('src/App.tsx', content);
  console.log("Found AOTR credit and removed it.");
} else {
  console.log("AOTR credit block not found. Checking exactly what it looks like.");
}
