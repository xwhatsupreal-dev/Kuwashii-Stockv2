const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf('  const renderModals = () => (\n    <>\n\n      {/* Authentication Modal */}');
if (startIndex !== -1) {
  let openBraces = 0;
  let foundStart = false;
  let endIndex = -1;
  for (let i = startIndex; i < code.length; i++) {
    if (code[i] === '(') openBraces++;
    if (code[i] === ')') openBraces--;
    if (code.substring(i, i+15) === 'const renderMod') foundStart = true;
    
    if (foundStart && openBraces === 0) {
      if (code.substring(i, i+3) === ');\n') {
        endIndex = i + 2;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    const modalsCode = code.substring(startIndex, endIndex);
    
    code = code.substring(0, startIndex) + code.substring(endIndex + 1);
    
    const targetStr = "if (appScreen === 'LOADING' || appScreen === 'TRANSITION') {";
    const targetIndex = code.indexOf(targetStr);
    
    if (targetIndex !== -1) {
      code = code.substring(0, targetIndex) + modalsCode + '\n\n  ' + code.substring(targetIndex);
      fs.writeFileSync('src/App.tsx', code);
      console.log('Moved renderModals successfully!');
    } else {
      console.log('Target string not found');
    }
  } else {
    console.log('Could not find end of renderModals');
  }
} else {
  console.log('renderModals not found');
}
