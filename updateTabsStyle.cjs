const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/flex p-1 rounded-\[14px\] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relative z-10 transition-all max-lg:data-\[landscape=true\]:flex-col max-lg:data-\[landscape=true\]:w-full space-y-0 max-lg:data-\[landscape=true\]:space-y-1 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700\/50/g,
  'flex p-1.5 rounded-2xl border dark:border-slate-800/80 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relative z-10 transition-all max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:w-full space-y-0 max-lg:data-[landscape=true]:space-y-1.5 bg-slate-100/80 dark:bg-[#0f172a]/60 backdrop-blur-xl border-slate-200/60');

c = c.replace(/'bg-white dark:bg-indigo-500\/10 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-500\/20'/g,
  "'bg-white dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-md border border-slate-200/60 dark:border-indigo-500/30 scale-100'");

c = c.replace(/'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200\/50'/g,
  "'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm scale-95 hover:scale-100'");

// Refresh Notifications/Menu icon buttons
c = c.replace(/className="p-1\.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition relative"/g,
  'className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition relative shadow-sm border border-slate-200 dark:border-slate-700"');
c = c.replace(/className="p-1\.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"/g,
  'className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm border border-slate-200 dark:border-slate-700"');


fs.writeFileSync('src/App.tsx', c);
