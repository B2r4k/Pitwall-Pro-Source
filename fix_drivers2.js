import fs from 'fs';

let c = fs.readFileSync('src/App.tsx', 'utf-8');

// The driver saving/loading logic
// We replace activeDriverId with an array `driverProfiles` in `cloudSave` and `loadFromCloud`
// And we add a UI section.

// Right now we have `const [player, setPlayer] = useState(...)` and `const [savedDriver2, setSavedDriver2] = useState(...)`.
// Instead, let's keep `player` state, but introduce `savedProfiles` array.

const stateTargetRegex = /const \[savedDriver2, setSavedDriver2\] = useState<PlayerStats>\(\{[\s\S]*?\}\);\n\s*const \[activeDriverId, setActiveDriverId\] = useState<1 \| 2>\(1\);\n\n\s*const toggleDriverProfile = \(id: 1 \| 2\) => \{[\s\S]*?\};\n/;

const newStates = `const [savedProfiles, setSavedProfiles] = useState<PlayerStats[]>([]);
  const [activeProfileIdx, setActiveProfileIdx] = useState<number>(0);
  
  const saveCurrentProfile = () => {
    const newProfiles = [...savedProfiles];
    if (newProfiles[activeProfileIdx]) {
      newProfiles[activeProfileIdx] = player;
    } else {
      newProfiles.push(player);
    }
    setSavedProfiles(newProfiles);
  };
  
  const switchProfile = (idx: number) => {
    const newProfiles = [...savedProfiles];
    newProfiles[activeProfileIdx] = player;
    setSavedProfiles(newProfiles);
    setActiveProfileIdx(idx);
    if (newProfiles[idx]) {
      setPlayer(newProfiles[idx]);
    } else {
      setPlayer({ ...player, name: 'New Driver ' + (idx + 1) });
    }
  };
  
  const deleteProfile = (idx: number) => {
    if (savedProfiles.length <= 1) return;
    const newProfiles = savedProfiles.filter((_, i) => i !== idx);
    setSavedProfiles(newProfiles);
    setActiveProfileIdx(0);
    setPlayer(newProfiles[0]);
  };
`;

c = c.replace(stateTargetRegex, newStates);

// Update load logic:
// if (data.playerStats) setPlayer(data.playerStats);
// if (data.savedDriver2) setSavedDriver2(data.savedDriver2);
// to handle `data.savedProfiles`
const loadLogicTarget = /if \(data\.playerStats\) setPlayer\(data\.playerStats\);\n\s*if \(data\.savedDriver2\) setSavedDriver2\(data\.savedDriver2\);/;
const newLoadLogic = `
        if (data.savedProfiles && data.savedProfiles.length > 0) {
           setSavedProfiles(data.savedProfiles);
           setPlayer(data.savedProfiles[data.activeProfileIdx || 0] || data.savedProfiles[0]);
           setActiveProfileIdx(data.activeProfileIdx || 0);
        } else if (data.playerStats) {
           setPlayer(data.playerStats);
           setSavedProfiles([data.playerStats, data.savedDriver2].filter(Boolean));
        }
`;
c = c.replace(loadLogicTarget, newLoadLogic);

// Update save logic:
c = c.replace(/playerStats: player,\n\s*savedDriver2: savedDriver2,/g, "savedProfiles: (() => { const p = [...savedProfiles]; p[activeProfileIdx] = player; return p; })(),\n           activeProfileIdx: activeProfileIdx,");

// Also there's a second save function `saveToCloud(newPlayer: PlayerStats)`
// let's replace there too:
c = c.replace(/playerStats: newPlayer,\n\s*savedDriver2: savedDriver2,/g, "savedProfiles: (() => { const p = [...savedProfiles]; p[activeProfileIdx] = newPlayer; return p; })(),\n         activeProfileIdx: activeProfileIdx,");

// Now update the UI for Driver Profile Selection
const driverUITarget = /<h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">[\s\S]*?\{t\('Ignore Stats \(Neutral\)'\)\}\n\s*<\/label>\n\s*<\/div>\n\s*<\/div>\n\s*<div className="space-y-4">/;

const newDriverUI = `<div className="flex flex-col mb-4 gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <User className="w-5 h-5 text-indigo-500" /> {t('Driver & Car Settings')}
                            <Tooltip content="Driver skills and chassis impact base wear." />
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 relative">
                             <select className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" value={activeProfileIdx} onChange={e => switchProfile(Number(e.target.value))}>
                               {savedProfiles.length > 0 ? savedProfiles.map((p, i) => (
                                  <option key={i} value={i}>{p.name || 'Driver ' + (i + 1)}</option>
                               )) : <option value={0}>{player.name || 'Driver 1'}</option>}
                               <option value={savedProfiles.length}>+ Add New Profile</option>
                             </select>
                             {savedProfiles.length > 1 && <button onClick={() => deleteProfile(activeProfileIdx)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs rounded-lg rounded-xl flex items-center shadow-sm">Delete</button>}
                             <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                                <label className="flex items-center gap-2 cursor-pointer w-full">
                                   <input type="checkbox" className="accent-indigo-500 w-4 h-4 cursor-pointer" checked={ignoreDriverStats} onChange={e => setIgnoreDriverStats(e.target.checked)} />
                                   {t('Ignore Stats (Neutral)')}
                                </label>
                             </div>
                          </div>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('Driver Name')}</label>
                           <input type="text" value={player.name || ''} onChange={e => setPlayer({...player, name: e.target.value})} placeholder="e.g. Verstappen" className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 dark:border-slate-700 border-slate-200 rounded-lg sm:text-sm focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-4">`;

c = c.replace(driverUITarget, newDriverUI);

fs.writeFileSync('src/App.tsx', c);
