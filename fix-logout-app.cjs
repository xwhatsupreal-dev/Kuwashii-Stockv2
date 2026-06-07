const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/logout\(\);\n *setIsAstdMenuOpen/g, "handleLogout();\n                                  setIsAstdMenuOpen");

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed logout bug');
