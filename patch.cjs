const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to inject `const renderAppContent = () => {` before `if (isUnderMaintenance`
code = code.replace("if (isUnderMaintenance && !isAdmin && appScreen !== 'LOADING' && appScreen !== 'TRANSITION') {",
`const renderAppContent = () => {
  if (isUnderMaintenance && !isAdmin && appScreen !== 'LOADING' && appScreen !== 'TRANSITION') {`);

// Now replace all the top-level returns inside renderAppContent.
// The end of `return (...)` usually is `  );\n}` for the main App. We must find the final one.
// Let's replace `<div className=\"min-h-screen` with `<motion.div layout key=\"XXX\" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className=\"min-h-screen`

code = code.replace(
  /if \(isUnderMaintenance(.+?)return \(\n\s*<div/s,
  `if (isUnderMaintenance$1return (\n      <motion.div key="maintenance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}`
);

code = code.replace(
  /if \(appScreen === 'LOADING' \|\| appScreen === 'TRANSITION'\) {\n\s*return \(\n\s*<div className="min-h-screen/s,
  `if (appScreen === 'LOADING' || appScreen === 'TRANSITION') {\n    return (\n      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="min-h-screen`
);

code = code.replace(
  /if \(appScreen === 'SELECT'\) {\n\s*return \(\n\s*<div className="min-h-screen/s,
  `if (appScreen === 'SELECT') {\n    return (\n      <motion.div key="select" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4 }} className="min-h-screen`
);

code = code.replace(
  /if \(appScreen === 'ASTD'\) {\n\s*return \(\n\s*<div className="min-h-screen/s,
  `if (appScreen === 'ASTD') {\n    return (\n      <motion.div key="astd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="min-h-screen`
);

code = code.replace(
  /  return \(\n\s*<div className="min-h-screen flex flex-col bg-zinc-950/s,
  `  return (\n    <motion.div key="aotr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="min-h-screen flex flex-col bg-zinc-950`
);

// We need to replace the closing `</div>` of these blocks with `</motion.div>`.
// Maintenance block ends with `</div>\n    );\n  }` wait, no it doesn't close App.
code = code.replace(
  /        {renderModals\(\)}\n      <\/div>\n    \);\n  }/g,
  `        {renderModals()}\n      </motion.div>\n    );\n  }`
);
code = code.replace(
  /        <\/div>\n      <\/div>\n    \);\n  }/g, // FOR LOADING
  `        </div>\n      </motion.div>\n    );\n  }`
);
// Replace the others.. Actually it's safer to just replace `</div>` at that exact indentation!
// Let's replace the last `  );\n}` to be `  );\n};\n\n  return (\n    <AnimatePresence mode="wait">\n      {renderAppContent()}\n    </AnimatePresence>\n  );\n}`

fs.writeFileSync('src/App.tsx', code);
