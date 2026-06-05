import fs from 'fs';

let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');

const wrongClosing = `            </div>\n\n            )}\n            {/* Quantity, Initial Quantity, Pieces per pack, and Price row */}`;
const correctClosing = `            </div>\n\n            </div>\n            )}\n            {/* Quantity, Initial Quantity, Pieces per pack, and Price row */}`;

if (content.includes(wrongClosing)) {
    content = content.replace(wrongClosing, correctClosing);
    fs.writeFileSync('src/components/AdminModal.tsx', content);
    console.log('Fixed syntax correctly');
} else {
    // try fallback fix
    content = content.replace(`            </div>\n\n            )}\n            {/* Quantity, Initial Quantity, Pieces per pack, and Price row */}`, `            </div>\n              </div>\n            )}\n            {/* Quantity, Initial Quantity, Pieces per pack, and Price row */}`);
    fs.writeFileSync('src/components/AdminModal.tsx', content);
}
