const fs = require('fs');
let c = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');

c = c.replace(/className="bg-slate-900 rounded-2xl p-6 text-white h-full shadow-lg border dark:border-slate-700 border-slate-800 flex flex-col"/g,
 'className="bg-white dark:bg-slate-900 rounded-2xl p-6 h-full shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col"');

c = c.replace(/className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-400"/g,
 'className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400"');

c = c.replace(/className="bg-slate-800\/50 p-4 rounded-xl border dark:border-slate-700 border-slate-700"/g,
 'className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700"');

c = c.replace(/className="text-2xl font-mono text-white"/g,
 'className="text-2xl font-mono text-slate-800 dark:text-white"');

c = c.replace(/className="text-slate-400 italic text-sm leading-relaxed"/g,
 'className="text-slate-600 dark:text-slate-400 italic text-sm leading-relaxed"');

c = c.replace(/className="bg-slate-800\/50 rounded-xl p-4 border border-slate-700"/g,
 'className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"');

fs.writeFileSync('src/components/CalibrationView.tsx', c);
