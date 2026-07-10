const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace('bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white shadow-lg shadow-slate-900/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group',
'bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-sm dark:shadow-lg rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group');

c = c.replace('bg-slate-800/50 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/50 shrink-0',
'bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shrink-0');

c = c.replace('text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap',
'text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap');

c = c.replace(/font-black text-lg text-white truncate max-w-\[200px\] sm:max-w-xs/g,
'font-black text-lg text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs');

c = c.replace('className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/50 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"',
'className="px-3 py-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/40 text-red-600 dark:text-red-100 border border-red-200 dark:border-red-500/50 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"');

c = c.replace(/bg-black\/40 backdrop-blur-md px-1\.5 sm:px-2 py-1\.5 rounded-xl w-12 sm:w-16 border border-white\/5/g,
'bg-slate-100 dark:bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-slate-200 dark:border-white/5');

c = c.replace(/<span className="text-\[9px\] text-slate-400 -mt-1 uppercase tracking-tighter">/g,
'<span className="text-[9px] text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-tighter">');

fs.writeFileSync('src/App.tsx', c);

let s = fs.readFileSync('src/components/SimulationEngine.tsx', 'utf-8');
s = s.replace('relative w-full h-40 sm:h-48 bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4',
'relative w-full h-40 sm:h-48 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4');

s = s.replace('bg-slate-900 border border-slate-800 rounded-2xl shadow-inner h-24 mb-2 flex items-center justify-center relative overflow-hidden md:col-span-2',
'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner h-24 mb-2 flex items-center justify-center relative overflow-hidden md:col-span-2');

s = s.replace('h-4 bg-slate-800 rounded-full border border-slate-700 relative overflow-visible',
'h-4 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 relative overflow-visible');

fs.writeFileSync('src/components/SimulationEngine.tsx', s);

let t = fs.readFileSync('src/components/Tooltip.tsx', 'utf-8');
t = t.replace('className="fixed z-[99999] w-max max-w-[250px] p-2.5 bg-slate-800 text-slate-100 text-[11px] rounded-lg shadow-xl shadow-slate-900/20 border border-slate-700 pointer-events-none leading-relaxed font-medium animate-in fade-in zoom-in-95 duration-100 whitespace-normal"',
'className="fixed z-[99999] w-max max-w-[250px] p-2.5 bg-slate-800 dark:bg-slate-800 text-slate-100 text-[11px] rounded-lg shadow-xl shadow-slate-900/20 border border-slate-700 pointer-events-none leading-relaxed font-medium animate-in fade-in zoom-in-95 duration-100 whitespace-normal"');
fs.writeFileSync('src/components/Tooltip.tsx', t);
