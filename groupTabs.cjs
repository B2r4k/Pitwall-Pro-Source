const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');

// We will update the nav bar.
// First, replace the old buttons with new ones.
const navBarRegex = /<div className="flex p-1 rounded-\[14px\] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relative z-10 transition-all max-lg:data-\[landscape=true\]:flex-col max-lg:data-\[landscape=true\]:w-full space-y-0 max-lg:data-\[landscape=true\]:space-y-1 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700\/50">[\s\S]*?<\/div>/;

const newNavBar = `<div className="flex p-1 rounded-[14px] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relative z-10 transition-all max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:w-full space-y-0 max-lg:data-[landscape=true]:space-y-1 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700/50">
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${['home', 'track_setup', 'strategy'].includes(activeTab) ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('strategy')}
                >
                  <span className="flex items-center gap-2"><Goal className="w-4 h-4" /> {t('Strategy & Track')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${['driver_profile', 'economy'].includes(activeTab) ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('driver_profile')}
                >
                  <span className="flex items-center gap-2"><User className="w-4 h-4" /> {t('Garage & Economy')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('assistant')}
                >
                  <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> {t('Data & Assistant')}</span>
                </button>
              </div>`;

c = c.replace(navBarRegex, newNavBar);

// Now, we modify the rendering conditions to group them vertically.
// Instead of `{activeTab === 'home' && ...}` we want to show multiple blocks.
// `strategy` tab includes: home, track_setup, strategy
// `driver_profile` tab includes: driver_profile, economy
// `assistant` tab includes: assistant, rival_analysis, telemetry

c = c.replace(/\{activeTab === 'home' && \(/g, "{['home', 'track_setup', 'strategy'].includes(activeTab) && (");
c = c.replace(/\{activeTab === 'track_setup' && \(/g, "{['home', 'track_setup', 'strategy'].includes(activeTab) && (");
c = c.replace(/\{activeTab === 'strategy' && \(/g, "{['home', 'track_setup', 'strategy'].includes(activeTab) && (");

c = c.replace(/\{activeTab === 'driver_profile' && \(/g, "{['driver_profile', 'economy'].includes(activeTab) && (");
c = c.replace(/\{activeTab === 'economy' && \(/g, "{['driver_profile', 'economy'].includes(activeTab) && (");

c = c.replace(/\{activeTab === 'assistant' && \(/g, "{['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) && (");
c = c.replace(/\{activeTab === 'rival_analysis' && \(/g, "{['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) && (");
c = c.replace(/\{activeTab === 'telemetry' && \(/g, "{['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) && (");


// I should remove the duplicated activeTab lines by just making them render inside one block.
// Wait, the easiest way is what I did above: replacing `{activeTab === 'x' && (` with a broader condition. 
// However, they will just stack on top of each other, which is perfectly fine for consolidation!

fs.writeFileSync('src/App.tsx', c);
