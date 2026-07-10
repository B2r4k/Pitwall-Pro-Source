import fs from 'fs';

let c = fs.readFileSync('src/App.tsx', 'utf-8');

const navStart = '<div className="flex p-1 rounded-[14px] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relatiand z-10 transition-all max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:w-full space-y-0 max-lg:data-[landscape=true]:space-y-1';
const navEnd = '</div>';

let startIndex = c.indexOf(navStart);
let endIndex = c.indexOf(navEnd, startIndex) + navEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
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

  c = c.substring(0, startIndex) + newNavBar + c.substring(endIndex);
  
  // Also we need to make sure 'tyre_analysis' button is removed and all.
  
  fs.writeFileSync('src/App.tsx', c);
  console.log("Navbar replaced successfully.");
} else {
  console.log("Could not find nav bar string.");
}
