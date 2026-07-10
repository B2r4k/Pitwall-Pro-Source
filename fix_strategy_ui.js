import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Fix the main strategy card's missing dark mode backgrounds
c = c.split("\${selectedStratIndex === 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-indigo-50 border-indigo-200'}").join("\${selectedStratIndex === 0 ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100' : 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-100'}");

// 2. Fix the strategy list card's missing dark mode backgrounds
c = c.split("\${isSelected ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800/80 cursor-pointer'}").join("\${isSelected ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700 dark:ring-indigo-700' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'}");

// 3. Fix the internal /50/50 typo and grey panels inside the cards
c = c.split('dark:bg-slate-800/50/50').join('dark:bg-slate-900');
c = c.split('bg-slate-50 dark:bg-slate-800/50 rounded"').join('bg-slate-50 dark:bg-slate-900 rounded"'); // span tag for stint index #
c = c.split('bg-white dark:bg-slate-900 rounded-xl p-4 border shadow-sm flex flex-col justify-between').join('bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border shadow-sm flex flex-col justify-between');

// Wait! In the graphs container:
c = c.split('bg-slate-50 dark:bg-slate-950 p-4').join('bg-slate-50 dark:bg-slate-900 p-4');

// 4. Update AreaChart dots
c = c.replace(/dot=\{\{r: 3, strokeWidth: 2, fill: isDark \? '#1e293b' : '#ffffff', stroke: '[^']+'\}\}/g, 'dot={false}');


fs.writeFileSync('src/App.tsx', c);
