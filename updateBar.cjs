const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="flex w-full h-6 rounded-lg overflow-visible bg-slate-100 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700\/60 shadow-inner">[\s\S]*?<\/span>\s*<\/div>\s*\)\s*\}\)\}\s*<\/div>/;

const stylishBar = `<div className="flex w-full h-8 gap-1 overflow-visible">
                            {selectedStrategy!.stints.map((st, idx) => {
                              const compoundColors: any = {
                                'XS': 'from-fuchsia-500 to-fuchsia-600 border-fuchsia-400',
                                'S': 'from-rose-500 to-rose-600 border-rose-400',
                                'M': 'from-amber-400 to-amber-500 border-amber-300',
                                'H': 'from-slate-300 to-slate-400 border-slate-200',
                                'Rain': 'from-cyan-400 to-cyan-500 border-cyan-300'
                              };
                              const width = \`\${(st.laps / activeTrack.laps) * 100}%\`;
                              return (
                                <div 
                                  key={idx} 
                                  style={{ width }} 
                                  className={\`bg-gradient-to-r \${compoundColors[st.tyres]} border-t border-l shadow-sm rounded-md relative group transition-all duration-300 hover:opacity-90 hover:scale-y-110 flex items-center justify-center cursor-crosshair z-10\`} 
                                >
                                   <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></div>
                                   <span className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg font-bold pointer-events-none whitespace-nowrap transition-all shadow-lg transform -translate-y-2 group-hover:translate-y-0">
                                       {t('Stint')} {idx + 1}: {st.laps} {t('Laps')} ({COMPOUND_FULL_NAMES[st.tyres]})
                                       <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45" />
                                   </span>
                                </div>
                              )
                            })}
                          </div>`;

if (app.match(regex)) {
   app = app.replace(regex, stylishBar);
}

fs.writeFileSync('src/App.tsx', app);
