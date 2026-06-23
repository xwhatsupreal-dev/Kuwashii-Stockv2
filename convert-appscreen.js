import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \[appScreen, setAppScreen\] = useState<[\s\S]*?>\(".*?"\);/,
  'const appScreen = "SHOP";\n  const setAppScreen = () => {};'
);

content = content.replace(
  /const \[targetScreen, setTargetScreen\] = useState<[\s\S]*?>\(null\);/,
  'const targetScreen = null;\n  const setTargetScreen = () => {};'
);

// We should just manually remove the 'appScreen' effect blocks if they error
// Wait actually, replacing appScreen with a constant "SHOP" will make everything bypass Select screen.
// We also need to change the if statements inside App.tsx rendering part.

// Let's replace the string checks:
content = content.replace(/appScreen === "LOADING"/g, 'appScreen === "LOADING"'); // if appScreen is SHOP, this is false
content = content.replace(/appScreen === "ASTD"/g, 'appScreen === "SHOP"');
content = content.replace(/appScreen === "AOTR"/g, 'false');
content = content.replace(/appScreen === "ROV"/g, 'false');
content = content.replace(/appScreen !== "ASTD"/g, 'appScreen !== "SHOP"');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('AppScreen modified!');
