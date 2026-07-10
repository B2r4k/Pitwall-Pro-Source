import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const titleLoc = `<div className="flex flex-col sm:flex-row justify-between items-center sm:items-start bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-40 transition-colors gap-3">
            {timeLeft && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm text-xs font-mono absolute top-2 right-2 sm:right-6 sm:top-[1.2rem] hidden md:flex">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="font-bold text-slate-800 dark:text-slate-200">{nextRaceName} In:</span>
                 <span className="text-red-600 font-bold">{timeLeft.d}d {timeLeft.h.toString().padStart(2,'0')}h {timeLeft.m.toString().padStart(2,'0')}m {timeLeft.s.toString().padStart(2,'0')}s</span>
              </div>
            )}`;

const backupLoc = `<div className="flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-40 transition-colors">`;

const betterMobileRepl = `<div className="flex flex-col sm:flex-row justify-between items-center sm:items-start bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-40 transition-colors gap-3">
            {timeLeft && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 shadow-sm text-[10px] sm:text-xs font-mono absolute top-2 right-12 sm:right-6 sm:top-[1.2rem]">
                 <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[80px] sm:max-w-none">{nextRaceName} In:</span>
                 <span className="text-red-600 font-bold">{timeLeft.d}d {timeLeft.h.toString().padStart(2,'0')}h {timeLeft.m.toString().padStart(2,'0')}m {timeLeft.s.toString().padStart(2,'0')}s</span>
              </div>
            )}`;

if (c.includes(titleLoc)) {
  c = c.replace(titleLoc, betterMobileRepl);
} else {
  c = c.replace(backupLoc, betterMobileRepl);
}
fs.writeFileSync('src/App.tsx', c);
