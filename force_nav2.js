import fs from 'fs';

let c = fs.readFileSync('src/App.tsx', 'utf-8');

// The original line was:
// <div className={\`flex p-1 rounded-[14px] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relatiand z-10 transition-all max-lg:data-\\[landscape=true\\]:flex-col max-lg:data-\\[landscape=true\\]:w-full space-y-0 max-lg:data-\\[landscape=true\\]:space-y-1 \${'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50'}\`}>

const startStr = 'overflow-x-auto scrollbar-hide shadow-inner relatiand z-10 transition-all';
let startIndex = c.indexOf(startStr);

if (startIndex !== -1) {
  // Find the exact <div ...> that starts before it
  let divStart = c.lastIndexOf('<div className={`flex p-1 rounded', startIndex);
  if (divStart === -1) {
    divStart = c.lastIndexOf('<div', startIndex);
  }
  
  // We need to find the matching </div>
  let endIndex = c.indexOf('</div>', startIndex) + 6;
  // Wait, no. There are button elements inside this div, so the first </div> will close the FIRST button? No, buttons are closed with </button>.
  // But there are tooltips? No, no tooltips.
  // Let's just find the closing </div> of this block.
  // It has 5 buttons. So we can look for the next </div> after the 5th icon.
  let btnEnd = c.indexOf('CheckCircle className="w-4 h-4"', startIndex);
  endIndex = c.indexOf('</button>', btnEnd) + 9;
  endIndex = c.indexOf('</div>', endIndex) + 6;

  const newNavBar = `<div className="flex p-1 rounded-[14px] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relative z-10 transition-all max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:w-full space-y-0 max-lg:data-[landscape=true]:space-y-1 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'home' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('home')}
                >
                  <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> {t('Dashboard Overview')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'track_setup' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('track_setup')}
                >
                  <span className="flex items-center gap-2"><Map className="w-4 h-4" /> {t('Track Setup & Car')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'strategy' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('strategy')}
                >
                  <span className="flex items-center gap-2"><Goal className="w-4 h-4" /> {t('Strategy Engine')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'assistant' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('assistant')}
                >
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {t('Setup Assistant')}</span>
                </button>
              </div>`;

  c = c.substring(0, divStart) + newNavBar + c.substring(endIndex);
  
  // also replace "relatiand" with "relative" everywhere just in case I messed it up earlier with find/replace
  c = c.replace(/relatiand/g, "relative");
  
  fs.writeFileSync('src/App.tsx', c);
  console.log("Navbar replaced successfully.");
} else {
  console.log("Could not find nav bar string.");
}
