const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/border dark:border-slate-700 border-slate-200 dark:border-slate-700/g, 'border border-slate-200 dark:border-slate-700');
c = c.replace(/border dark:border-slate-700 border-slate-200/g, 'border border-slate-200 dark:border-slate-700');

fs.writeFileSync('src/App.tsx', c);
