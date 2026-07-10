const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace('bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-white dark:border-slate-800/50',
'bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-sm dark:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-800');

c = c.replace('w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0',
'w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0');

c = c.replace('<CheckCircle className="w-6 h-6 text-indigo-400" />',
'<CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />');

c = c.replace('<h3 className="text-white font-bold text-lg">{t(\'Race Preparation Status\')}</h3>',
'<h3 className="text-slate-900 dark:text-white font-bold text-lg">{t(\'Race Preparation Status\')}</h3>');

c = c.replace('className="text-slate-400 text-sm"',
'className="text-slate-500 dark:text-slate-400 text-sm"');

// also Clock in timeLeft
c = c.replace('<Clock className="w-5 h-5 text-indigo-400" />',
'<Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />');

fs.writeFileSync('src/App.tsx', c);
