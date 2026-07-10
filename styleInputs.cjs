const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Modernize input fields globally in App.tsx
c = c.replace(/className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm/g, 'className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none');

c = c.replace(/className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3/g, 'className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none');

// Make Select dropdowns look consistent
c = c.replace(/<select\s+value=\{/g, '<select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all outline-none" value={');

fs.writeFileSync('src/App.tsx', c);
