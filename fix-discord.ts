import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace Purchase calls
content = content.replace(/sendDiscordPurchaseEmbed\([\s\S]*?webhookDrops,\s*\);/g, 'sendDiscordPurchaseEmbed(\n        currentUser.username,\n        item.name,\n        purchaseQty,\n        liveItemQty - purchaseQty,\n        webhookDrops,\n        appScreen\n      );');

// Replace Angpao Success
content = content.replace(/sendDiscordTopupEmbed\(\s*activeUsername,\s*amount,\s*"angpao",\s*newBalance,\s*true,\s*\n\s*\);?/g, 'sendDiscordTopupEmbed(\n              activeUsername,\n              amount,\n              "angpao",\n              newBalance,\n              true,\n              appScreen\n            );');

// Replace Angpao Fail
content = content.replace(/sendDiscordTopupEmbed\([\s\S]*?"angpao",[\s\S]*?false,[\s\S]*?\n\s*\);/g, 'sendDiscordTopupEmbed(\n              activeUsername,\n              0,\n              "angpao",\n              (liveUser[appScreen === "ROV" ? "balance_rov" : "balance"] || 0),\n              false,\n              appScreen\n            );');

// Replace Bank Success
content = content.replace(/sendDiscordTopupEmbed\(\s*activeUsername,\s*amount,\s*"bank",\s*newBalance,\s*true,\s*\n\s*\);?/g, 'sendDiscordTopupEmbed(\n              activeUsername,\n              amount,\n              "bank",\n              newBalance,\n              true,\n              appScreen\n            );');

// Replace Bank Fail
content = content.replace(/sendDiscordTopupEmbed\([\s\S]*?"bank",[\s\S]*?false,[\s\S]*?\n\s*\);/g, 'sendDiscordTopupEmbed(\n              activeUsername,\n              0,\n              "bank",\n              (liveUser[appScreen === "ROV" ? "balance_rov" : "balance"] || 0),\n              false,\n              appScreen\n            );');

// Topup Modal warning
const topupTarget = `ทำรายการผ่านช่องทางที่ท่านสะดวก\n                </p>\n              </div>`;
const topupReplacement = `ทำรายการผ่านช่องทางที่ท่านสะดวก\n                </p>\n              </div>\n              <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">\n                <span className="text-amber-500 text-xs font-bold leading-tight flex-1">⚠️ คำเตือน: เครดิต และ สต๊อกสินค้า จะแยกกันในแต่ละโซนเกม (ASTD/ROV) ไม่สามารถใช้ร่วมกันได้</span>\n              </div>`;

content = content.replace(topupTarget, topupReplacement);

const topupTarget2 = `ทำรายการผ่านช่องทางที่ท่านสะดวก
                </p>
              </div>`;
const topupReplacement2 = `ทำรายการผ่านช่องทางที่ท่านสะดวก
                </p>
              </div>
              <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
                <span className="text-amber-500 text-[11px] font-bold leading-tight flex-1">⚠️ คำเตือน: ยอดเงินจะเข้าสู่โซนเกมที่คุณเลือกเท่านั้น (ASTD/ROV) ไม่สามารถโอนย้ายได้</span>
              </div>`;

content = content.replace(topupTarget2, topupReplacement2);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed app discord calls');
