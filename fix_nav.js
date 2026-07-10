import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(
  /const \[activeTab, setActiveTab\] = useState.*?\('home'\);/, 
  "const [activeTab, setActiveTab] = useState<'home' | 'strategy' | 'track_setup' | 'assistant'>('home');"
);

// We need to rewrite the nav bar buttons.
const navBarRegex = /<div className="flex p-1 rounded-\[14px\] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relatiand z-10 transition-all max-lg:data-\[landscape=true\]:flex-col max-lg:data-\[landscape=true\]:w-full space-y-0 max-lg:data-\[landscape=true\]:space-y-1 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700\/50">[\s\S]*?<\/div>/;

const newNavBar = `<div className="flex p-1 rounded-[14px] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relatiand z-10 transition-all max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:w-full space-y-0 max-lg:data-[landscape=true]:space-y-1 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relatiand max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'home' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('home')}
                >
                  <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> {t('Dashboard Overview')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relatiand max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'track_setup' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('track_setup')}
                >
                  <span className="flex items-center gap-2"><Map className="w-4 h-4" /> {t('Track Setup & Car')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relatiand max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'strategy' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('strategy')}
                >
                  <span className="flex items-center gap-2"><Goal className="w-4 h-4" /> {t('Strategy Engine')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relatiand max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'assistant' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('assistant')}
                >
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {t('Setup Assistant')}</span>
                </button>
              </div>`;

c = c.replace(navBarRegex, newNavBar);

// Now merge calibration and checklist into 'assistant'
const activeCalibRegex = /\{activeTab === 'calibration' && \([\s\S]*?<CalibrationView player=\{player\} setPlayer=\{setPlayer\} \/>\n\s*\)\}/;
const activeChecklistRegex = /\{activeTab === 'checklist' && \([\s\S]*?<ChecklistView currentUser=\{currentUser\} goToTab=\{setActiveTab\} \/>\n\s*\)\}/;

c = c.replace(activeCalibRegex, "");
c = c.replace(activeChecklistRegex, "");

const mergedAssistant = `
          {activeTab === 'assistant' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-6">
                  <ChecklistView currentUser={currentUser} goToTab={(tab) => {
                     // If the checklist item points to calibration or something else inside the assistant, how do we handle it?
                     // Well Calibration and Checklist are now both in 'assistant'!
                     if (tab === 'calibration') {
                         document.getElementById('calibration-view')?.scrollIntoView({ behavior: 'smooth' });
                     } else {
                         setActiveTab(tab);
                     }
                  }} />
                  
                  <div id="calibration-view" className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                     <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-6">
                        <Wrench className="w-5 h-5 text-indigo-500" /> {t('Calibration (Test Laps)')}
                     </h2>
                     <CalibrationView player={player} setPlayer={setPlayer} />
                  </div>
               </div>
               
               <div className="lg:col-span-4">
                  <QuickNotes currentUser={currentUser} />
               </div>
            </div>
          )}
`;

c = c.replace(/<\/main>/, mergedAssistant + "\n        </main>");

fs.writeFileSync('src/App.tsx', c);
