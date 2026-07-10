const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Rewrite the Timer
const oldTimerRegex = /\{timeLeft && \(\n\s*<div className="bg-white dark:bg-slate-900 border dark:border-slate-700 border-slate-200 shadow-sm rounded-2xl p-4 flex items-center justify-between">[\s\S]*?<\/div>\n\s*\)\}/;

const newTimer = `{timeLeft && (
               <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-900/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mx-10 -my-10 pointer-events-none"></div>
                 <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                   <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shrink-0">
                     <Clock className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">{t('Next Race')}</p>
                     <p className="font-black text-xl text-white whitespace-nowrap">{nextRaceName ? t(nextRaceName) : (t('Pending') + '...')}</p>
                   </div>
                 </div>
                 <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-3 w-full sm:w-auto font-mono font-bold text-xl lg:text-3xl relative z-10">
                   <div className="flex-1 sm:flex-none flex flex-col items-center bg-black/20 backdrop-blur-md px-2 py-2 rounded-2xl min-w-[3.5rem] sm:min-w-[4.5rem]"><span>{timeLeft.d.toString().padStart(2, '0')}</span><span className="text-[10px] text-indigo-300 -mt-1 uppercase max-sm:tracking-tighter">{t('Days')}</span></div>
                   <span className="text-indigo-300 opacity-50 pb-3">:</span>
                   <div className="flex-1 sm:flex-none flex flex-col items-center bg-black/20 backdrop-blur-md px-2 py-2 rounded-2xl min-w-[3.5rem] sm:min-w-[4.5rem]"><span>{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[10px] text-indigo-300 -mt-1 uppercase">{t('Hrs')}</span></div>
                   <span className="text-indigo-300 opacity-50 pb-3">:</span>
                   <div className="flex-1 sm:flex-none flex flex-col items-center bg-black/20 backdrop-blur-md px-2 py-2 rounded-2xl min-w-[3.5rem] sm:min-w-[4.5rem]"><span>{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[10px] text-indigo-300 -mt-1 uppercase">{t('Min')}</span></div>
                   <span className="text-indigo-300 opacity-50 pb-3">:</span>
                   <div className="flex-1 sm:flex-none flex flex-col items-center bg-black/20 backdrop-blur-md px-2 py-2 rounded-2xl min-w-[3.5rem] sm:min-w-[4.5rem]"><span>{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-[10px] text-indigo-300 -mt-1 uppercase">{t('Sec')}</span></div>
                 </div>
               </div>
             )}`;

if (app.match(oldTimerRegex)) {
    app = app.replace(oldTimerRegex, newTimer);
} else {
    console.log("Timer match failed");
}

fs.writeFileSync('src/App.tsx', app);
