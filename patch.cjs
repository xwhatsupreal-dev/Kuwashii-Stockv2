const fs = require('fs');
const path = require('path');
const dir = 'src/components';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace max-h-[80vh] style to max-h-[80dvh]
    const updated = content.replace(/max-h-\[([0-9]+)vh\]/g, 'max-h-[$1dvh]')
                           .replace(/h-\[([0-9]+)vh\]/g, 'h-[$1dvh]');
    
    if (updated !== content) {
      fs.writeFileSync(filePath, updated);
      console.log('Fixed', file);
    }
  }
}
