const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix border on Login Screen
c = c.replace('border dark:border-slate-800/80 border-slate-200', 'border border-slate-200 dark:border-slate-800/80');

// Fix hover borders in menu
c = c.replace('hover:border-indigo-300 transition', 'hover:border-indigo-300 dark:hover:border-indigo-500 transition');
c = c.replace('hover:border-orange-300 transition', 'hover:border-orange-300 dark:hover:border-orange-500 transition');
c = c.replace('hover:border-emerald-300 transition', 'hover:border-emerald-300 dark:hover:border-emerald-500 transition');

fs.writeFileSync('src/App.tsx', c);
