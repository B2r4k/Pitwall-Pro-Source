import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const anchor = `<button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'assistant' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('assistant')}
                >
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> {t('Assistant')}</span>
                </button>`;

const replacement = `<button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'driver_profile' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('driver_profile')}
                >
                  <span className="flex items-center gap-2"><User className="w-4 h-4" /> Driver Profile</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'assistant' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('assistant')}
                >
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> {t('Assistant')}</span>
                </button>`;

c = c.replace(anchor, replacement);
fs.writeFileSync('src/App.tsx', c);
