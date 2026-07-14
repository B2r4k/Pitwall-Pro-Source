const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// We need to modify loadFromCloudData and useEffect for auth
c = c.replace(
  `  const loadFromCloudData = async (activeUid: string, shouldSetSyncing = true) => {`,
  `  const resetToDefaults = () => {
    setPlayer(DEFAULT_PLAYER);
    setWeather(defaultWeatherState);
    setCustomTrack(defaultCustomTrack);
    setLocalSettings(defaultSettings);
    setSavedProfiles([]);
    setActiveProfileIdx(0);
    setConstants(defaultConstants);
  };

  const loadFromCloudData = async (activeUid: string | null, shouldSetSyncing = true) => {`
);

fs.writeFileSync('src/App.tsx', c);
