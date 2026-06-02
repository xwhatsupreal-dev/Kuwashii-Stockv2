const fs = require('fs');

let src = fs.readFileSync('src/App.tsx', 'utf-8');

// Find all return blocks
// We will replace `if (appScreen === 'ASTD') {\n    return (` with `if (appScreen === 'ASTD') {\n    return (\n      <motion.div key="astd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="min-h-screen">`
// Wait, they all have a top-level div with "min-h-screen". Let's inject motion.div there.

// We need to change the function layout so we return the AnimatePresence outer.
// Doing it via RegExp is risky. Let's do string replacement manually.

// 1. replace `if (appScreen === 'LOADING' || appScreen === 'TRANSITION') {\n    return (`
src = src.replace(/if \(appScreen === 'LOADING' \|\| appScreen === 'TRANSITION'\) \{\n    return \(\n      <div/g, 
  `if (appScreen === 'LOADING' || appScreen === 'TRANSITION') {\n    return (\n      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}`);

// 2. SELECT
src = src.replace(/if \(appScreen === 'SELECT'\) \{\n    return \(\n      <div/g, 
  `if (appScreen === 'SELECT') {\n    return (\n      <motion.div key="select" initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.5 }}`);

// 3. ASTD
src = src.replace(/if \(appScreen === 'ASTD'\) \{\n    return \(\n      <div/g, 
  `if (appScreen === 'ASTD') {\n    return (\n      <motion.div key="astd" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}`);

// 4. AOTR (The final return)
src = src.replace(/\n  return \(\n    <div className="min-h-screen flex flex-col bg-zinc-950/g, 
  `\n  return (\n    <motion.div key="aotr" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} className="min-h-screen flex flex-col bg-zinc-950`);

// And we must replace the closing `</div>\n    );\n  }` with `</motion.div>\n    );\n  }` where appropriate.
// Wait, actually earlier returns end with `</div>\n    );\n  }`
// To make `AnimatePresence` work for the ROOT, they have to be rendered WITHIN one tree, we cannot early return from the App component and expect AnimatePresence to animate the removed component! AnimatePresence only works when standard React rendering switches children within it.

// Ah... `early returns` completely unmount the AnimatePresence (or skip it entirely meaning no exit animations).
// We must wrap the whole thing! Do something like:

/*
  const renderAppContent = () => {
     if (isUnderMaintenance...) return <Maintenance />;
     if (appScreen === 'LOADING' || appScreen === 'TRANSITION') return <Loading key="loading"/>;
     if (appScreen === 'SELECT') return <Select key="select"/>;
     if (appScreen === 'ASTD') return <ASTD key="astd"/>;
     return <AOTR key="aotr"/>;
  };

  return (
    <AnimatePresence mode="wait">
      {renderAppContent()}
    </AnimatePresence>
  )
*/
fs.writeFileSync('patch.js', src);
