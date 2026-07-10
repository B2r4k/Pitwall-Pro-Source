const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');
c = c.replace(/dark:bg-slate-900 dark:hover:bg-slate-800/g, 'dark:hover:bg-slate-800');
c = c.replace(/bg-white dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700/g, 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700');
c = c.replace(/bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700/g, 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700');

fs.writeFileSync('src/App.tsx', c);
