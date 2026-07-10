const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Title styling
c = c.replace(/<h1 className="text-xl font-black tracking-tight flex items-baseline gap-1">Pitwall <span className="text-indigo-600">Pro<\/span>/, '<h1 className="text-2xl font-display font-black tracking-tight flex items-baseline gap-1">Pitwall <span className="text-indigo-600">Pro</span>');

// Background updates
c = c.replace(/bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100/g, 'bg-slate-50/50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-100');

// Header background
c = c.replace(/bg-white dark:bg-slate-950\/80 border-slate-200 dark:border-slate-800/g, 'bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50');

// Buttons styling on tabs (navBar)
c = c.replace(/'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600'/g, "'bg-white dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-500/20'");

// Update container styling for cards to have slight modern borders
c = c.replace(/bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/g, 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 shadow-sm');

// Replace standard sans with global application style
c = c.replace(/font-sans/g, 'font-sans antialiased');

// Dashboard summary stats cards
c = c.replace(/className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"/g, 'className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"');

fs.writeFileSync('src/App.tsx', c);
