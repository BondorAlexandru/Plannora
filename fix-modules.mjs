#!/usr/bin/env node

// This script helps fix ES module vs CommonJS module issues
// Run with: node fix-modules.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix postcss.config.js
try {
  const postcssPath = path.join(__dirname, 'postcss.config.js');
  if (fs.existsSync(postcssPath)) {
    let content = fs.readFileSync(postcssPath, 'utf8');
    if (content.includes('module.exports')) {
      content = content.replace('module.exports', 'export default');
      fs.writeFileSync(postcssPath, content);
    } 
  }
} catch (error) {
  console.error('❌ Error fixing postcss.config.js:', error);
}

// Fix tailwind.config.js
try {
  const tailwindPath = path.join(__dirname, 'tailwind.config.js');
  if (fs.existsSync(tailwindPath)) {
    let content = fs.readFileSync(tailwindPath, 'utf8');
    if (content.includes('module.exports')) {
      content = content.replace('module.exports', 'export default');
      fs.writeFileSync(tailwindPath, content);
      console.log('✅ Fixed tailwind.config.js to use ES modules');
    } else {
      console.log('✅ tailwind.config.js already using ES modules');
    }
  }
} catch (error) {
  console.error('❌ Error fixing tailwind.config.js:', error);
}
