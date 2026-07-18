const fs = require('fs');
const path = require('path');

const replacements = [
  { match: /\bbg-white\b/g, replace: 'bg-white dark:bg-slate-900', target: 'dark:bg-slate-900' },
  { match: /\bbg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-slate-950', target: 'dark:bg-slate-950' },
  { match: /\bbg-gray-50\b/g, replace: 'bg-gray-50 dark:bg-slate-950', target: 'dark:bg-slate-950' },
  { match: /\btext-slate-900\b/g, replace: 'text-slate-900 dark:text-white', target: 'dark:text-white' },
  { match: /\btext-gray-900\b/g, replace: 'text-gray-900 dark:text-white', target: 'dark:text-white' },
  { match: /\btext-slate-800\b/g, replace: 'text-slate-800 dark:text-slate-100', target: 'dark:text-slate-100' },
  { match: /\btext-gray-800\b/g, replace: 'text-gray-800 dark:text-slate-100', target: 'dark:text-slate-100' },
  { match: /\btext-slate-700\b/g, replace: 'text-slate-700 dark:text-slate-200', target: 'dark:text-slate-200' },
  { match: /\btext-gray-700\b/g, replace: 'text-gray-700 dark:text-slate-200', target: 'dark:text-slate-200' },
  { match: /\btext-slate-600\b/g, replace: 'text-slate-600 dark:text-slate-300', target: 'dark:text-slate-300' },
  { match: /\btext-gray-600\b/g, replace: 'text-gray-600 dark:text-slate-300', target: 'dark:text-slate-300' },
  { match: /\btext-slate-500\b/g, replace: 'text-slate-500 dark:text-slate-400', target: 'dark:text-slate-400' },
  { match: /\btext-gray-500\b/g, replace: 'text-gray-500 dark:text-slate-400', target: 'dark:text-slate-400' },
  { match: /\bborder-slate-200\b/g, replace: 'border-slate-200 dark:border-slate-800', target: 'dark:border-slate-800' },
  { match: /\bborder-gray-200\b/g, replace: 'border-gray-200 dark:border-slate-800', target: 'dark:border-slate-800' },
  { match: /\bdivide-gray-200\b/g, replace: 'divide-gray-200 dark:divide-slate-800', target: 'dark:divide-slate-800' },
  { match: /\bdivide-slate-200\b/g, replace: 'divide-slate-200 dark:divide-slate-800', target: 'dark:divide-slate-800' },
  { match: /\bborder-slate-100\b/g, replace: 'border-slate-100 dark:border-slate-800\/50', target: 'dark:border-slate-800\/50' },
  { match: /\bhover:bg-slate-50\b/g, replace: 'hover:bg-slate-50 dark:hover:bg-slate-800\/50', target: 'dark:hover:bg-slate-800\/50' },
  { match: /\bhover:bg-gray-50\b/g, replace: 'hover:bg-gray-50 dark:hover:bg-slate-800\/50', target: 'dark:hover:bg-slate-800\/50' },
  { match: /\bhover:bg-slate-100\b/g, replace: 'hover:bg-slate-100 dark:hover:bg-slate-800', target: 'dark:hover:bg-slate-800' },
  { match: /\bbg-slate-100\b/g, replace: 'bg-slate-100 dark:bg-slate-800', target: 'dark:bg-slate-800' },
  { match: /\bbg-gray-100\b/g, replace: 'bg-gray-100 dark:bg-slate-800', target: 'dark:bg-slate-800' },
  { match: /\btext-slate-400\b/g, replace: 'text-slate-400 dark:text-slate-500', target: 'dark:text-slate-500' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // We only want to replace inside className strings or template literals.
  // Since finding exactly boundaries is hard, we can just replace globally,
  // BUT we must ensure we don't duplicate if the target is already present.
  
  replacements.forEach(({ match, replace, target }) => {
    // A regex that matches the class, but only if it's NOT followed somewhere ahead by the target
    // Actually, simpler: replace it, then clean up duplicates later if they exist.
    // E.g., 'bg-white dark:bg-slate-900 dark:bg-slate-900' -> 'bg-white dark:bg-slate-900'
    
    // Split by the class, and if the next chunk doesn't start with the target, apply replacement.
    const parts = content.split(match);
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        // If the right part already has the dark variant right after, skip it.
        // e.g., parts[i] = ' className="', match is gone, parts[i+1] = ' dark:bg-slate-900 text-sm"'
        if (!parts[i+1].trim().startsWith(target)) {
          parts[i] = parts[i] + replace;
          changed = true;
        } else {
          parts[i] = parts[i] + match.source.replace(/\\b/g, ''); // put it back
        }
      }
      content = parts.join('');
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      // Skip Dashboard and AdminLayout as they were manually tailored
      if (!fullPath.includes('Dashboard.tsx') && !fullPath.includes('AdminLayout.tsx')) {
        processFile(fullPath);
      }
    }
  }
}

walkDir(path.join(__dirname, 'apps/web/src/pages'));
walkDir(path.join(__dirname, 'apps/web/src/components'));

console.log('Mass dark theme injection complete.');
