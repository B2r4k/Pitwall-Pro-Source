import fs from 'fs';

let c = fs.readFileSync('src/App.tsx', 'utf-8');

const oldStateStr = `  const [savedDriver2, setSavedDriver2] = useState<PlayerStats>({
    baseFuelPerLap: 3.0,
    baseWearMultiplier: 1.0,
    riskAggression: 20,
    driverFocus: 100,
    driverStamina: 100,
    driverExperience: 50,
    tyreSupplier: 'Pipirelli'
  });
  const [activeDriverId, setActiveDriverId] = useState<1 | 2>(1);

  const toggleDriverProfile = (id: 1 | 2) => {
    if (activeDriverId === id) return;
    const currentActive = player;
    setPlayer(savedDriver2);
    setSavedDriver2(currentActive);
    setActiveDriverId(id);
  };`;

const newStates = `  const [savedProfiles, setSavedProfiles] = useState<PlayerStats[]>([]);
  const [activeProfileIdx, setActiveProfileIdx] = useState<number>(0);
  
  const switchProfile = (idx: number) => {
    const newProfiles = [...savedProfiles];
    if (savedProfiles.length === 0) newProfiles.push(player);
    else newProfiles[activeProfileIdx] = player;
    
    setSavedProfiles(newProfiles);
    setActiveProfileIdx(idx);
    if (newProfiles[idx]) {
      setPlayer(newProfiles[idx]);
    } else {
      setPlayer({ ...player, name: 'Driver ' + (idx + 1) });
    }
  };
  
  const deleteProfile = (idx: number) => {
    if (savedProfiles.length <= 1) return;
    const newProfiles = savedProfiles.filter((_, i) => i !== idx);
    setSavedProfiles(newProfiles);
    setActiveProfileIdx(0);
    setPlayer(newProfiles[0]);
  };`;

c = c.replace(oldStateStr, newStates);

const loadTargetStr = `        if (data.playerStats) setPlayer(data.playerStats);
        if (data.savedDriver2) setSavedDriver2(data.savedDriver2);`;
        
const newLoadStr = `        if (data.savedProfiles && data.savedProfiles.length > 0) {
           setSavedProfiles(data.savedProfiles);
           setPlayer(data.savedProfiles[data.activeProfileIdx || 0] || data.savedProfiles[0]);
           setActiveProfileIdx(data.activeProfileIdx || 0);
        } else if (data.playerStats) {
           setPlayer(data.playerStats);
           setSavedProfiles([data.playerStats, data.savedDriver2].filter(Boolean));
        }`;
        
c = c.replace(loadTargetStr, newLoadStr);

c = c.replace(/playerStats: player,\n\s*savedDriver2: savedDriver2,/g, "savedProfiles: (() => { const p = [...savedProfiles]; p[activeProfileIdx] = player; return p.length > 0 ? p : [player]; })(),\n           activeProfileIdx: activeProfileIdx,");
c = c.replace(/playerStats: newPlayer,\n\s*savedDriver2: savedDriver2,/g, "savedProfiles: (() => { const p = [...savedProfiles]; p[activeProfileIdx] = newPlayer; return p.length > 0 ? p : [newPlayer]; })(),\n         activeProfileIdx: activeProfileIdx,");


// Dependency array in auto-save:
c = c.replace(/\[currentUser, player, settings, customTrack, weather, constants\]/, "[currentUser, player, settings, customTrack, weather, constants, savedProfiles, activeProfileIdx]");


const driverUITargetRegex = /<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-0 px-1 gap-4">[\s\S]*?\{t\('Ignore Stats \(Neutral\)'\)\}\n\s*<\/label>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<div className="space-y-4">/;

const newDriverUI = `<div className="flex flex-col mb-4 gap-4 px-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <User className="w-5 h-5 text-indigo-500" /> {t('Driver & Car Settings')}
                            <Tooltip content="Driver skills and chassis impact base wear." />
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 relative">
                             <select className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-indigo-700 dark:text-indigo-400" value={activeProfileIdx} onChange={e => switchProfile(Number(e.target.value))}>
                               {savedProfiles.length > 0 ? savedProfiles.map((p, i) => (
                                  <option key={i} value={i}>{p.name || 'Driver ' + (i + 1)}</option>
                               )) : <option value={0}>{player.name || 'Driver 1'}</option>}
                               <option value={savedProfiles.length > 0 ? savedProfiles.length : 1}>+ Add New Profile</option>
                             </select>
                             {savedProfiles.length > 1 && <button onClick={() => deleteProfile(activeProfileIdx)} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 text-xs rounded-lg flex items-center shadow-sm font-bold">Delete</button>}
                             <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                                <label className="flex items-center gap-2 cursor-pointer w-full">
                                   <input type="checkbox" className="accent-indigo-500 w-4 h-4 cursor-pointer" checked={ignoreDriverStats} onChange={e => setIgnoreDriverStats(e.target.checked)} />
                                   {t('Ignore Stats (Neutral)')}
                                </label>
                             </div>
                          </div>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('Driver Name')}</label>
                           <input type="text" value={player.name || ''} onChange={e => setPlayer({...player, name: e.target.value})} placeholder="e.g. Verstappen" className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg sm:text-sm focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-4">`;

c = c.replace(driverUITargetRegex, newDriverUI);

fs.writeFileSync('src/App.tsx', c);
