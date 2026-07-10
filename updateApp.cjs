const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

// The Jolpi URL is fetched in an initial useEffect block. Let's find it.
const fetchRegex = /useEffect\(\(\) => \{\s*\/\/ Fetch Next Race info\s*fetch\('https:\/\/api\.jolpi\.ca[\s\S]*?\}\);\n  \}, \[\]\);/;
if (app.match(fetchRegex)) {
  app = app.replace(fetchRegex, '');
}

// We redefine guessCurrentTrack
const guessRegex = /const guessCurrentTrack = async \(\) => \{[\s\S]*?setSyncStatus\(''\), 2000\);\n     \}\n  \};/;
const newGuessLogic = `const guessCurrentTrack = async (isAuto = false) => {
    try {
      if (!isAuto) setSyncStatus(t('Fetching liand calendar...'));
      const response = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');
      const data = await response.json();
      const race = data.MRData.RaceTable.Races[0];
      
      // Update timer states
      if (race) {
         setNextRaceName(race.raceName);
         const raceDate = new Date(\`\${race.date}T\${race.time || '15:00:00Z'}\`);
         setNextRaceTime(raceDate.getTime());
      }

      if (race) {
         const circuitId = race.Circuit.circuitId.toLowerCase();
         let matchedId = 'montreal'; 
         const dbIds = TRACK_DATABASE.map(t => t.id);
         
         if (circuitId.includes('silverstone')) matchedId = 'silverstone';
         else if (circuitId.includes('albert') || circuitId.includes('melbourne')) matchedId = 'melbourne';
         else if (circuitId.includes('bahrain')) matchedId = 'bahrain';
         else if (circuitId.includes('catalunya')) matchedId = 'catalunya';
         else if (circuitId.includes('monaco')) matchedId = 'monaco';
         else if (dbIds.includes(circuitId)) matchedId = circuitId;
         
         if (!isAuto || (isAuto && !customTrack && selectedTrackId === 'melbourne')) {
            setSelectedTrackId(matchedId);
            if (!isAuto) alert(\`☁️ Liand Calendar Sync: Next race is \${race.raceName}. Track mapped to \${matchedId.toUpperCase()}.\`);
         }
      }
    } catch (e) {
      console.error("Calendar fetch error:", e);
      if (!isAuto) {
         alert("Liand feed unavailable or error occurred.");
      }
    } finally {
      if (!isAuto) setTimeout(() => setSyncStatus(''), 2000);
    }
  };

  useEffect(() => {
    // Auto-fetch on boot
    guessCurrentTrack(true);
  }, []);`;

app = app.replace(guessRegex, newGuessLogic);

// Remove timer from header.
// First, we find the old header div (maybe it isn't rendered but let's check if there's any `{timeLeft &&`)
// Wait, the timer was not efficiently injected in previous run. Let me inject it into the Dashboard.
const dashboardRegex = /\{activeTab === 'home' && \(\n          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">/;
const newDashboardTimer = `{activeTab === 'home' && (
          <div className="flex flex-col space-y-6 animate-fade-in">
             {timeLeft && (
               <div className="bg-white dark:bg-slate-900 border dark:border-slate-700 border-slate-200 shadow-sm rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('Next Race')}</p>
                        <p className="font-black text-slate-800 dark:text-slate-100">{nextRaceName || 'Pending...'}</p>
                     </div>
                  </div>
                  <div className="flex gap-2 font-mono font-bold text-xl lg:text-2xl text-indigo-600 dark:text-indigo-400">
                     <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl"><span>{timeLeft.d.toString().padStart(2, '0')}</span><span className="text-[10px] text-slate-400 -mt-1">D</span></div>
                     <span>:</span>
                     <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl"><span>{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[10px] text-slate-400 -mt-1">H</span></div>
                     <span>:</span>
                     <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl"><span>{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[10px] text-slate-400 -mt-1">M</span></div>
                     <span>:</span>
                     <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl"><span>{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-[10px] text-slate-400 -mt-1">S</span></div>
                  </div>
               </div>
             )}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;

if (app.match(dashboardRegex)) {
  app = app.replace(dashboardRegex, newDashboardTimer);
  // Close the new wrapper div somewhere?
  // We need to add a closing div where `activeTab === 'home'` ends.
  // The activeTab blocks usually end with `</div>\n          )}`.
  // Let's find: `<button onClick={() => setActiveTab('strategy')} className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold transition w-fit">View Strategies</button>\n             </div>\n             \n             <div className="rounded-2xl p-6 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">`
  // Actually, wait, the closing of the `grid` is what we need to close.
  const endOfHomeTabRegex = /(<button onClick=\{\(\) => setActiveTab\('assistant'\)\} className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition w-fit flex items-center gap-2">Open Assistant <ChevronRight className="w-4 h-4" \/><\/button>\n             <\/div>\n          <\/div>)/;
  app = app.replace(endOfHomeTabRegex, "$1\n          </div>");
}

// Removing Save/Load from Account section
const saveLoadRegex = /<div className="w-full space-y-3 mt-4">\s*<button\s*onClick=\{[^}]+\}\s*disabled=\{isSyncing\}\s*className="bg-indigo-600[^>]+>[^<]+<\/button>\s*<button\s*onClick=\{[^}]+\}\s*disabled=\{isSyncing\}\s*className="bg-white[^>]+>[^<]+<\/button>(\s*\{syncStatus[^}]+\}\s*<\/div>)/m;

if (app.match(saveLoadRegex)) {
   app = app.replace(saveLoadRegex, '<div className="w-full space-y-3 mt-4 text-center text-sm font-bold text-slate-400">Settings and active profile auto-sync is enabled.</div>$1');
}

fs.writeFileSync('src/App.tsx', app);
