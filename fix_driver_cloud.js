import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const tAnchor = `  const resetPlayerSettings = () => {`;
const cloudFuncs = `
  const saveDriverToCloud = async () => {
    if (!currentUser) return alert(t('Please login to save to cloud'));
    setIsSyncing(true);
    setSyncStatus(t('Saving driver...'));
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await setDoc(doc(db, 'drivers', currentUser.uid), { player }, { merge: true });
      setSyncStatus(t('Saved!'));
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setSyncStatus('Error');
      setTimeout(() => setSyncStatus(''), 2000);
    }
    setIsSyncing(false);
  };

  const loadDriverFromCloud = async () => {
    if (!currentUser) return alert(t('Please login to load from cloud'));
    setIsSyncing(true);
    setSyncStatus(t('Loading driver...'));
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const d = await getDoc(doc(db, 'drivers', currentUser.uid));
      if (d.exists() && d.data().player) {
         setPlayer(d.data().player);
         setSyncStatus(t('Loaded!'));
      } else {
         setSyncStatus(t('No saved profile found.'));
      }
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setSyncStatus('Error');
      setTimeout(() => setSyncStatus(''), 2000);
    }
    setIsSyncing(false);
  };

  const resetPlayerSettings = () => {`;

c = c.replace(tAnchor, cloudFuncs);

const renderAnchor = `                        <Tooltip content="{t('Driver skills and chassis impact base wear.')}" />
                      </h2>
                      <button onClick={resetPlayerSettings}`;

const cloudRender = `                        <Tooltip content="{t('Driver skills and chassis impact base wear.')}" />
                      </h2>
                      <div className="flex items-center gap-1">
                        {isSyncing && <span className="text-xs text-indigo-500 font-medium mr-2">{syncStatus}</span>}
                        <button onClick={loadDriverFromCloud} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Load from Cloud"><CloudCog className="w-4 h-4" /></button>
                        <button onClick={saveDriverToCloud} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition" title="Save to Cloud"><Save className="w-4 h-4" /></button>
                        <button onClick={resetPlayerSettings}`;

c = c.replace(renderAnchor, cloudRender);

fs.writeFileSync('src/App.tsx', c);
