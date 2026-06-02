import fs from 'fs';
import path from 'path';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('<button')) return;

  // Check if motion is already imported
  if (!content.includes('import { motion }') && !content.includes('import { motion ')) {
    content = `import { motion } from 'motion/react';\n` + content;
  }

  // Check if we already have whileTap={{ scale: 0.95 }}
  // To avoid duplicate whileTaps, we're doing a simple replace, but we only want to replace actual buttons.
  // Actually, some motion.button might exist and be modified by this regex accidentally?
  // Let's replace <button with <motion.button whileTap={{ scale: 0.95 }}
  // We'll replace <button( |>) with <motion.button whileTap={{ scale: 0.95 }}$1
  const updated = content
    .replace(/<button\b(?! whileTap)/g, '<motion.button whileTap={{ scale: 0.95 }}')
    .replace(/<\/button>/g, '</motion.button>');

  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log(`Patched ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      patchFile(fullPath);
    }
  }
}

walk('src');
