const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/border border-slate-800/g, 'border border-white dark:border-slate-800');
fs.writeFileSync('src/App.tsx', content);
