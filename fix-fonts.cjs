const fs = require('fs');

function applyFonts(file) {
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(/font-sans/g, 'font-display tracking-tight');
  // Make large numbers look good
  code = code.replace(/text-2xl font-black/g, 'text-3xl font-display font-medium tracking-tighter glowing-text');
  
  fs.writeFileSync(file, code);
}

['src/App.tsx', 'src/components/ItemCard.tsx', 'src/components/AdminModal.tsx', 'src/components/InquiryModal.tsx', 'src/components/LiveActivities.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    applyFonts(file);
    console.log("Applied fonts to " + file);
  }
});
