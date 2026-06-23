import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/className="min-h-\[100vh\] min-h-\[100dvh\] flex flex-col bg-transparent text-slate-800 font-display tracking-tight[^"]*"\s*>/g,
  '$&\n        <ShopHeader toggleSidebar={() => {}} onSearchToggle={() => {}} currentUser={currentUser} onLoginClick={() => { setShowAuthModal(true); setAuthMode("login"); }} />');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Headers added!');
