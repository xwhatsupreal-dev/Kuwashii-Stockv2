const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const statementBlock = `    if (appScreen === "STATEMENT") {
      return (
        <motion.div
           key="statement"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="min-h-[100vh] min-h-[100dvh] flex flex-col bg-zinc-950 text-zinc-200 font-display tracking-tight w-full"
        >
          <ShopHeader toggleSidebar={() => setIsAstdMenuOpen(true)} onSearchToggle={() => {}} currentUser={currentUser} onLoginClick={() => { setShowAuthModal(true); setAuthMode("login"); }} />
          
          <main className="flex-grow w-full pt-20 pb-10">
            <Statement currentUser={currentUser} onLoginClick={() => { setShowAuthModal(true); setAuthMode("login"); }} />
          </main>
          
          {renderModals()}
        </motion.div>
      );
    }`;

code = code.replace('if (appScreen === "SHOP") {', statementBlock + '\n\n    if (appScreen === "SHOP") {');
fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Statement added to App.tsx");
