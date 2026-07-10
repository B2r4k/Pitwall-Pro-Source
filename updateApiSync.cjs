const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Update initial settings
app = app.replace(
  /apiSyncOptions: \{ driver: true, car: true, race: true \}/g,
  "apiSyncOptions: { driver: true, car: true, track: true, weather: true, risks: true, ignoreFiltersAuto: true }"
);

// 2. We need to rewrite fetchGproApi to fetch multiple endpoints and aggregate the scraped data.
// We'll replace the block from `const fetchGproApi = async (isAuto = false) => {` down to `setApiPreview({ ... }); ... } catch ... }`

const fetchBodyReplacement = `const fetchGproApi = async (isAuto = false) => {
    if (!settings.gproToken) {
       if (!isAuto) alert(t("Lütfen Settings kısmından GPRO API Token (JWT) bilginizi girin."));
       return;
    }
    if (isSyncing) return;
    setIsSyncing(true);
    if (!isAuto) setSyncStatus(t('GPRO Resmi API ile Bağlanıyor...'));
    
    try {
      const headers = {
         'Authorization': \`Bearer \${settings.gproToken}\`,
         'Accept': 'application/json'
      };

      const endpoints = ['/backend/api/v2/DriProfile', '/backend/api/v2/Practice'];
      const responses = await Promise.all(endpoints.map(ep => fetch('https://gpro.net/gb' + ep, { method: 'GET', headers })));
      
      let scrapedData = {};
      for (const res of responses) {
          if (res.ok) {
             const data = await res.json();
             scrapedData = { ...scrapedData, ...data };
          }
      }

      if (!scrapedData.energy && !scrapedData.carPower) {
         throw new Error("GPRO API Fetch failed or empty data. Token may be invalid.");
      }
      
      // Save directly to raw driverStats collection for cloud persistence
      if (currentUser && currentUser.uid && scrapedData.concentration !== undefined) {
         try {
            const { serverTimestamp } = await import('firebase/firestore');
            await setDoc(doc(db, 'driverStats', currentUser.uid), {
                userId: currentUser.uid,
                energy: scrapedData.energy || 0,
                focus: scrapedData.concentration || 0,
                stamina: scrapedData.stamina || 0,
                experience: scrapedData.experience || 0,
                weight: scrapedData.weight || 0,
                updatedAt: serverTimestamp()
            }, { merge: true });
         } catch (firebaseErr) {
            console.error("Failed to persist raw Driver Stats to Cloud:", firebaseErr);
         }
      }

      const opt = settings.apiSyncOptions || { driver: true, car: true, track: true, weather: true, risks: true, ignoreFiltersAuto: true };
      const applyFilters = isAuto ? !opt.ignoreFiltersAuto : true; // If auto and ignore is true, apply all. Otherwise use filters.
      
      const checkFilter = (key) => applyFilters ? opt[key] : true;

      // Prepare preview data based on filters
      const previewObj = {};
      if (checkFilter('driver')) {
         previewObj.driver = {
            energy: scrapedData.energy,
            focus: scrapedData.concentration,
            stamina: scrapedData.stamina,
            experience: scrapedData.experience,
            weight: scrapedData.weight,
            aggression: scrapedData.aggressiveness
         };
      }
      if (checkFilter('car')) {
         previewObj.car = {
            power: scrapedData.carPower,
            handling: scrapedData.carHandl,
            acceleration: scrapedData.carAccel,
            wear: {
               chassis: scrapedData.usaChassis,
               engine: scrapedData.usaEngine,
               frontWing: scrapedData.usaFWing,
               rearWing: scrapedData.usaRWing,
               underbody: scrapedData.usaUnderbody,
               sidepods: scrapedData.usaSidepods,
               cooling: scrapedData.usaCooling,
               gearbox: scrapedData.usaGear,
               brakes: scrapedData.usaBrakes,
               suspension: scrapedData.usaSusp
            },
            levels: {
               chassis: scrapedData.lvlChassis,
               engine: scrapedData.lvlEngine,
               frontWing: scrapedData.lvlFWing,
               rearWing: scrapedData.lvlRWing,
               underbody: scrapedData.lvlUnderbody,
               sidepods: scrapedData.lvlSidepods,
               cooling: scrapedData.lvlCooling,
               gearbox: scrapedData.lvlGear,
               brakes: scrapedData.lvlBrakes,
               suspension: scrapedData.lvlSusp
            }
         };
      }
      if (checkFilter('track') && scrapedData.trackId) {
         previewObj.track = { id: scrapedData.trackId, name: scrapedData.trackName };
      }
      if (checkFilter('weather') && scrapedData.weather) {
         previewObj.weather = {
            q1Temp: scrapedData.weather.q1Temp,
            q2Temp: scrapedData.weather.q2Temp,
            raceTempLow: scrapedData.weather.raceQ1TempLow, // They usually use Q1/Q2/Q3/Q4 ranges but Practice API returns raceQ1/raceQ2/raceQ3... Wait, we can average them.
            raceTempHigh: scrapedData.weather.raceQ4TempHigh || scrapedData.weather.raceQ1TempHigh
         };
      }
      if (checkFilter('risks')) {
         previewObj.risks = {
            overtake: scrapedData.riskOvertake,
            defend: scrapedData.riskBlock,
            clearDry: scrapedData.riskClearDry,
            clearWet: scrapedData.riskClearWet
         };
      }

      if (isAuto) {
         // Auto-apply silently
         applyApiDataFn(previewObj, isAuto);
         setLocalSettings(s => ({ ...s, lastApiSyncTime: Date.now() }));
      } else {
         // Manual mode: Show Verification Preview
         setApiPreview(previewObj);
      }
    } catch (err) {
      console.error(err);
      if (!isAuto) alert(t("API Error: ") + err.message);
    } finally {
      setIsSyncing(false);
      if (!isAuto) setTimeout(() => setSyncStatus(''), 2000);
    }
  };

  const applyApiDataFn = (dataPreview, isAuto = false) => {
     setPlayer(p => {
         const newP = { ...p };
         let changed = false;
         
         if (dataPreview.driver) {
             const d = dataPreview.driver;
             if (d.energy !== undefined && newP.energy !== d.energy) { newP.energy = d.energy; changed = true; }
             if (d.focus !== undefined && newP.driverFocus !== d.focus) { newP.driverFocus = d.focus; changed = true; }
             if (d.stamina !== undefined && newP.driverStamina !== d.stamina) { newP.driverStamina = d.stamina; changed = true; }
             if (d.experience !== undefined && newP.driverExperience !== d.experience) { newP.driverExperience = d.experience; changed = true; }
             if (d.aggression !== undefined && newP.riskAggression !== d.aggression) { newP.riskAggression = d.aggression; changed = true; }
         }
         if (dataPreview.car) {
             const wear = dataPreview.car.wear;
             if (wear && wear.chassis !== undefined) {
                 if (!newP.carWear) newP.carWear = {};
                 newP.carWear = { ...wear };
                 changed = true;
             }
             const levels = dataPreview.car.levels;
             if (levels && levels.chassis !== undefined) {
                 if (!newP.carParts) newP.carParts = {};
                 newP.carParts = { ...levels };
                 changed = true;
             }
         }
         if (dataPreview.risks) {
             const r = dataPreview.risks;
             if (!newP.risks) newP.risks = { overtake: 0, defend: 0, clearDry: 0, clearWet: 0 };
             if (r.overtake !== undefined && newP.risks.overtake !== r.overtake) { newP.risks.overtake = r.overtake; changed = true; }
             if (r.defend !== undefined && newP.risks.defend !== r.defend) { newP.risks.defend = r.defend; changed = true; }
             if (r.clearDry !== undefined && newP.risks.clearDry !== r.clearDry) { newP.risks.clearDry = r.clearDry; changed = true; }
             if (r.clearWet !== undefined && newP.risks.clearWet !== r.clearWet) { newP.risks.clearWet = r.clearWet; changed = true; }
         }
         return changed ? newP : p;
     });

     if (dataPreview.track && dataPreview.track.id) {
         // Auto-select track
         // GPRO uses track ID. In our app, we might need a mapping.
     }
     
     if (dataPreview.weather) {
         setWeather(w => {
            let nw = { ...w };
            let changed = false;
            if (dataPreview.weather.raceTempLow !== undefined) {
               const avg = (dataPreview.weather.raceTempLow + dataPreview.weather.raceTempHigh) / 2;
               if (!isNaN(avg)) {
                  nw.tempBase = dataPreview.weather.raceTempLow;
                  nw.tempMax = dataPreview.weather.raceTempHigh;
                  changed = true;
               }
            }
            return changed ? nw : w;
         });
     }

     if (!isAuto) {
         setApiPreview(null);
         setSyncStatus(t('Veriler Güncellendi!'));
         setTimeout(() => setSyncStatus(''), 3000);
         if (appView !== 'calculator') setAppView('calculator');
     }
  };`;

const targetStart = "const fetchGproApi = async (isAuto = false) => {";
const targetEnd = "  const guessCurrentTrack = async (isAuto = false) => {";

const startIndex = app.indexOf(targetStart);
const endIndex = app.indexOf(targetEnd);

app = app.substring(0, startIndex) + fetchBodyReplacement + "\n\n" + app.substring(endIndex);

app = app.replace("applyApiData={applyApiData}", "applyApiData={() => applyApiDataFn(apiPreview)}");

fs.writeFileSync('src/App.tsx', app);
