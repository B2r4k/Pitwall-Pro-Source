const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const banner = `
          {['home', 'track_setup', 'strategy'].includes(activeTab) && (
            <div className="mb-6 bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                     <CheckCircle className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                     <h3 className="text-white font-bold text-lg">{t('Race Preparation Status')}</h3>
                     <p className="text-slate-400 text-sm">
                        {!selectedTrackId ? t('Select a track to begin.') : (!player.experience ? t('Enter driver skills for accurate wear.') : t('All systems ready for strategy calculation.'))}
                     </p>
                  </div>
               </div>
               <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
                  <span className={\`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border \${selectedTrackId ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}\`}>
                     {t('Track Data')}
                  </span>
                  <span className={\`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border \${weather.q1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}\`}>
                     {t('Weather')}
                  </span>
                  <span className={\`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border \${player.experience ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}\`}>
                     {t('Driver Stats')}
                  </span>
               </div>
            </div>
          )}
          {['home', 'track_setup', 'strategy'].includes(activeTab) && (`;

c = c.replace(/\{\[\'home\', \'track_setup\', \'strategy\'\]\.includes\(activeTab\) && \(/, banner);

fs.writeFileSync('src/App.tsx', c);
