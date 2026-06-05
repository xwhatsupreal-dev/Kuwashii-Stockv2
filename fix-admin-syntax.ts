import fs from 'fs';

let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');

// I will fix the wrapper.
// Notice lines 386-391
const wrongCode = `            {/* Quantity, Initial Quantity, Pieces per pack, and Price row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              </div>
            )}
            <div>`;

const correctCode = `            )}
            {/* Quantity, Initial Quantity, Pieces per pack, and Price row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>`;

content = content.replace(wrongCode, correctCode);

fs.writeFileSync('src/components/AdminModal.tsx', content);
console.log('Fixed syntax error');
