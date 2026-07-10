const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const timerRegex = /<div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-900\/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">[\s\S]*?<\/div>\s*\)\}/;

const newTimer = `<div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white shadow-lg shadow-slate-900/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mx-10 -my-10 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                 <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
                   <div className="bg-slate-800/50 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/50 shrink-0">
                     <Clock className="w-5 h-5 text-indigo-400" />
                   </div>
                   <div className="min-w-0 pr-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">{t('Next Race')}</p>
                     <p className="font-black text-lg text-white truncate max-w-[200px] sm:max-w-xs">{nextRaceName ? t(nextRaceName) : (t('Pending') + '...')}</p>
                   </div>
                 </div>
                 <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto font-mono font-bold text-xl sm:text-2xl relative z-10 shrink-0">
                   <div className="flex flex-col items-center bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-white/5"><span>{timeLeft.d.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-400 -mt-1 uppercase tracking-tighter">{t('Days')}</span></div>
                   <span className="text-slate-500 pb-3">:</span>
                   <div className="flex flex-col items-center bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-white/5"><span>{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-400 -mt-1 uppercase tracking-tighter">{t('Hrs')}</span></div>
                   <span className="text-slate-500 pb-3">:</span>
                   <div className="flex flex-col items-center bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-white/5"><span>{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-400 -mt-1 uppercase tracking-tighter">{t('Min')}</span></div>
                   <span className="text-slate-500 pb-3">:</span>
                   <div className="flex flex-col items-center bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-white/5"><span>{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-400 -mt-1 uppercase tracking-tighter">{t('Sec')}</span></div>
                 </div>
               </div>
             )}`;

if (app.match(timerRegex)) {
   app = app.replace(timerRegex, newTimer);
   fs.writeFileSync('src/App.tsx', app);
   console.log("Timer updated");
} else {
   console.log("Timer match failed");
}
