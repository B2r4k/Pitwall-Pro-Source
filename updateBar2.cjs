const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="flex w-full h-8 gap-1 overflow-visible">[\s\S]*?<\/div>(\s*\)\})*\}?\s*<\/div>/;

const newBar = `<div className="flex w-full h-8 gap-2 overflow-visible bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                            {selectedStrategy!.stints.map((st, idx) => {
                              const compoundThemes: any = {
                                'XS': 'bg-fuchsia-500 shadow-fuchsia-500/20 text-fuchsia-100',
                                'S': 'bg-rose-500 shadow-rose-500/20 text-rose-100',
                                'M': 'bg-amber-400 shadow-amber-400/20 text-amber-900',
                                'H': 'bg-slate-200 dark:bg-slate-300 shadow-slate-300/20 text-slate-800',
                                'Rain': 'bg-cyan-500 shadow-cyan-500/20 text-cyan-100'
                              };
                              const width = \`\${(st.laps / activeTrack.laps) * 100}%\`;
                              return (
                                <div 
                                  key={idx} 
                                  style={{ width }} 
                                  className={\`\${compoundThemes[st.tyres]} rounded-lg relative group transition-all duration-300 hover:scale-y-110 flex items-center justify-center cursor-pointer shadow-sm border border-black/10 dark:border-white/10\`} 
                                >
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-50 mix-blend-overlay"></div>
                                   <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                   <span className="font-black text-[10px] tracking-tighter opacity-80 mix-blend-hard-light relative z-10 hidden sm:block">{st.tyres}</span>
                                   <span className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-800 text-white text-[11px] py-1.5 px-3 rounded-lg font-bold pointer-events-none whitespace-nowrap transition-all shadow-xl transform -translate-y-2 group-hover:translate-y-0 z-20 border border-slate-700">
                                       <span className="text-slate-400">{t('Stint')} {idx + 1}:</span> {st.laps} {t('Laps')} <span className="text-slate-400 text-[9px] uppercase ml-1">({COMPOUND_FULL_NAMES[st.tyres]})</span>
                                       <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-r border-b border-slate-700 rotate-45" />
                                   </span>
                                </div>
                              )
                            })}
                          </div>`;

if (app.match(regex)) {
   app = app.replace(regex, newBar);
   fs.writeFileSync('src/App.tsx', app);
   console.log("Bar updated");
} else {
   console.log("Bar match failed");
}
