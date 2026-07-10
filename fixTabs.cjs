const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Update Navbar
const oldNav = `<div className="flex p-1 rounded-[14px] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relative z-10 transition-all max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:w-full space-y-0 max-lg:data-[landscape=true]:space-y-1 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700/50">
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${['home', 'track_setup', 'strategy'].includes(activeTab) ? 'bg-white dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('strategy')}
                >
                  <span className="flex items-center gap-2"><Goal className="w-4 h-4" /> {t('Strategy & Track')}</span>
                </button>`;

const newNav = `<div className="flex p-1 rounded-[14px] border dark:border-slate-700 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner relative z-10 transition-all max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:w-full space-y-0 max-lg:data-[landscape=true]:space-y-1 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700/50">
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'home' ? 'bg-white dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('home')}
                >
                  <span className="flex items-center gap-2"><Home className="w-4 h-4" /> {t('Dashboard')}</span>
                </button>
                <button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${['track_setup', 'strategy'].includes(activeTab) ? 'bg-white dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('strategy')}
                >
                  <span className="flex items-center gap-2"><Goal className="w-4 h-4" /> {t('Strategy & Track')}</span>
                </button>`;
c = c.replace(oldNav, newNav);

const bannerCond = `{['home', 'track_setup', 'strategy'].includes(activeTab) && (
            <div className="mb-6 bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/50">`;

const newBannerCond = `{['track_setup', 'strategy'].includes(activeTab) && (
            <div className="mb-6 bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/50">`;
c = c.replace(bannerCond, newBannerCond);

const dashboardCond = `{['home', 'track_setup', 'strategy'].includes(activeTab) && (
          <div className="flex flex-col space-y-6 animate-fade-in">
             {timeLeft && (`

const newDashboardCond = `{activeTab === 'home' && (
          <div className="flex flex-col space-y-6 animate-fade-in">
             {timeLeft && (`
c = c.replace(dashboardCond, newDashboardCond);

const trackSetupCond = `{['home', 'track_setup', 'strategy'].includes(activeTab) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 max-lg:data-[landscape=true]:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: TRACK & WEATHER */}`;

const newTrackSetupCond = `{['track_setup', 'strategy'].includes(activeTab) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 max-lg:data-[landscape=true]:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: TRACK & WEATHER */}`;
c = c.replace(trackSetupCond, newTrackSetupCond);

const strategyCond = `{['home', 'track_setup', 'strategy'].includes(activeTab) && (
            <div className="flex flex-col gap-6">
                {/* DASHBOARD TOP STATS */}`;
const newStrategyCond = `{['track_setup', 'strategy'].includes(activeTab) && (
            <div className="flex flex-col gap-6">
                {/* DASHBOARD TOP STATS */}`;
c = c.replace(strategyCond, newStrategyCond);

fs.writeFileSync('src/App.tsx', c);
