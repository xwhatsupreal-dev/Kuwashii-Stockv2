import fs from 'fs';

['src/components/ShopBanner.tsx', 'src/components/ShopHeader.tsx', 'src/App.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/1000098144\.webp/g, '1000109791.png');
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Logo updated!');
