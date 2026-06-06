import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const rovStartIdx = content.indexOf('if (appScreen === "ROV") {');
const rovEndIdx = content.indexOf('}; // end renderAppScreen', rovStartIdx);

let rovBlock = content.substring(rovStartIdx, rovEndIdx);

const target = `{/* Chat now button */}
                <a
                  href="https://m.me/kuwashii"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="py-2.5 px-4 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/5 hover:scale-[1.02] active:scale-95"
                  id="btn-nav-chat"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>ทักแชททันที (Messenger)</span>
                </a>`;
                
const replacement = `{/* Chat now button */}
                <a
                  href="https://discord.gg/AQKtJpvyva"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="py-2.5 px-4 rounded-xl border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/5 hover:scale-[1.02] active:scale-95"
                  id="btn-nav-chat"
                >
                  <MessageCircle className="w-4 h-4 text-indigo-400" />
                  <span>ดิสคอร์ดเซิฟเวอร์</span>
                </a>`;

rovBlock = rovBlock.replace(target, replacement);

content = content.substring(0, rovStartIdx) + rovBlock + content.substring(rovEndIdx);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed ROV Discord link');
