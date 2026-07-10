const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace('className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"', 'className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"');
fs.writeFileSync('src/App.tsx', content);

let tcontent = fs.readFileSync('src/components/TrackAnalysisView.tsx', 'utf-8');
tcontent = tcontent.replace('className="bg-slate-200 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-xs font-bold"', 'className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-xs font-bold"');
fs.writeFileSync('src/components/TrackAnalysisView.tsx', tcontent);
