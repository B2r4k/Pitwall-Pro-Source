import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const anchor = `             <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2"><Goal className="text-indigo-500 w-5 h-5"/> {t('Top Strategy')}</h3>
                   {results.length > 0 ? (
                      <div>
                         <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{results[0].stops} Stop</p>
                         <p className="text-slate-500 dark:text-slate-400 text-sm">{results[0].stints.map(s => s.tyres).join(' -> ')}</p>
                      </div>
                   ) : <p className="text-red-500 text-sm">No valid strategy found.</p>}
                </div>
                <button onClick={() => setActiveTab('strategy')} className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold transition w-fit">View Strategies</button>
             </div>`;

const newCode = `             <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2"><Goal className="text-indigo-500 w-5 h-5"/> {t('Top Strategy')}</h3>
                   {results.length > 0 ? (
                      <div>
                         <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{results[0].stops} Stop</p>
                         <p className="text-slate-500 dark:text-slate-400 text-sm">{results[0].stints.map(s => s.tyres).join(' -> ')}</p>
                      </div>
                   ) : <p className="text-red-500 text-sm">No valid strategy found.</p>}
                </div>
                <button onClick={() => setActiveTab('strategy')} className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold transition w-fit">View Strategies</button>
             </div>
             
             <div className="rounded-2xl p-6 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5"/> AI Assistant</h3>
                   <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1">Race Analysis & Pre-Race Checklist</p>
                   <p className="text-emerald-600/80 dark:text-emerald-500/80 text-xs">Calibration and test lap evaluator.</p>
                </div>
                <button onClick={() => setActiveTab('assistant')} className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition w-fit flex items-center gap-2">Open Assistant <ChevronRight className="w-4 h-4" /></button>
             </div>`;

c = c.replace(anchor, newCode);

fs.writeFileSync('src/App.tsx', c);
