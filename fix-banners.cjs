const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/border border-zinc-900 flex flex-col/g, 'border border-white/5 shadow-sm backdrop-blur-sm flex flex-col');

fs.writeFileSync('src/App.tsx', app);
console.log("Updated banners.");
