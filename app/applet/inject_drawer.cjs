const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!content.includes('import { MobileDrawer }')) {
  // find last import
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfLastImport + 1) + 
            'import { MobileDrawer } from "./components/MobileDrawer";\n' + 
            content.slice(endOfLastImport + 1);
}

// 2. Change toggleSidebar
content = content.replace(
  'toggleSidebar={() => {}}',
  'toggleSidebar={() => setIsAstdMenuOpen(true)}'
);

// 3. Add MobileDrawer rendering
if (!content.includes('<MobileDrawer isOpen={isAstdMenuOpen}')) {
  content = content.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*$/m,
    `      <MobileDrawer
        isOpen={isAstdMenuOpen}
        onClose={() => setIsAstdMenuOpen(false)}
        currentUser={currentUser}
        onLoginClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
        onLogoutClick={handleLogout}
        setPage={setAppScreen}
        setShowTopupModal={setShowTopupModal}
      />\n    </div>\n  </div>\n</div>\n`
  );
  
  // if regex didn't match perfectly, just find the very last </div> and insert before it
  if (!content.includes('<MobileDrawer isOpen={isAstdMenuOpen}')) {
      const lastDiv = content.lastIndexOf('</div>');
      content = content.slice(0, lastDiv) + `      <MobileDrawer
        isOpen={isAstdMenuOpen}
        onClose={() => setIsAstdMenuOpen(false)}
        currentUser={currentUser}
        onLoginClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
        onLogoutClick={handleLogout}
        setPage={setAppScreen}
        setShowTopupModal={setShowTopupModal}
      />\n` + content.slice(lastDiv);
  }
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
