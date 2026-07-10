import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const tAnchor = `  const loadFromCloudData = async (uid, shouldSetSyncing = true) => {`;
const tEnd = `  const loadFromCloud = () => {`;

// Replace auto-save and initial load logic with LocalStorage versions!
const replacement = `  const loadFromCloudData = async (uid, shouldSetSyncing = true) => {
    try {
      if (shouldSetSyncing) setIsSyncing(true);
      setSyncStatus('Loading...');
      const stored = localStorage.getItem('gpro_calculator_save');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.savedProfiles && data.savedProfiles.length > 0) {
           setSavedProfiles(data.savedProfiles);
           setPlayer(data.savedProfiles[data.activeProfileIdx || 0] || data.savedProfiles[0]);
           setActiveProfileIdx(data.activeProfileIdx || 0);
        }
        if (data.settings) setLocalSettings(data.settings);
        if (data.customTrack) setCustomTrack(data.customTrack);
        if (data.weather) setWeather(data.weather);
        if (data.constants) setConstants(data.constants);
        setSyncStatus('Loaded successfully!');
        setTimeout(() => setSyncStatus(''), 3000);
      } else {
        setSyncStatus('No local save found.');
        setTimeout(() => setSyncStatus(''), 3000);
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('Load error!');
      setTimeout(() => setSyncStatus(''), 3000);
    } finally {
      if (shouldSetSyncing) setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Also load on boot!
    loadFromCloudData('local_uid', false);
    
    // Auth is kept if they still want to log in, but we don't depend on Firestore!
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const loadFromCloud = () => {
    loadFromCloudData('local_uid', true);
  };

  // Auto-save logic (Local Storage)
  useEffect(() => {
    if (settings.smartSync) {
      const timeout = setTimeout(() => {
        try {
          const payload = {
             savedProfiles: (() => { const p = [...savedProfiles]; p[activeProfileIdx] = player; return p.length > 0 ? p : [player]; })(),
             activeProfileIdx: activeProfileIdx,
             settings: settings,
             customTrack: customTrack,
             weather: weather,
             constants: constants,
             updatedAt: new Date().toISOString()
          };
          localStorage.setItem('gpro_calculator_save', JSON.stringify(payload));
          setSyncStatus('Saved successfully!');
          setTimeout(() => setSyncStatus(''), 2000);
        } catch (e) {
           console.error(e);
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [player, settings, customTrack, weather, constants, savedProfiles, activeProfileIdx]);

  const _unused_saveToCloud = () => {};`;

// I'll run a precise substring replacement
const startIndex = c.indexOf("const loadFromCloudData = async (uid, shouldSetSyncing = true) => {");
const endIndex = c.indexOf("const saveDriverToCloud = async () => {");
if (startIndex !== -1 && endIndex !== -1) {
  c = c.substring(0, startIndex) + replacement + "\n\n" + c.substring(endIndex);
}

fs.writeFileSync('src/App.tsx', c);
