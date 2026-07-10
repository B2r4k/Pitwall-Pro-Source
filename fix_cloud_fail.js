import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const tAnchor = `  const saveDriverToCloud = async () => {`;
const cloudFuncs = `
  const saveDriverToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus(t('Saving driver...'));
    try {
      localStorage.setItem('f1_manager_driver_profile', JSON.stringify(player));
      setSyncStatus(t('Saved successfully!'));
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setSyncStatus('Error');
      setTimeout(() => setSyncStatus(''), 2000);
    }
    setIsSyncing(false);
  };

  const loadDriverFromCloud = async () => {
    setIsSyncing(true);
    setSyncStatus(t('Loading driver...'));
    try {
      const data = localStorage.getItem('f1_manager_driver_profile');
      if (data) {
         setPlayer(JSON.parse(data));
         setSyncStatus(t('Loaded successfully!'));
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

  const _unused_saveToCloud = async () => {`;

const oldLoadFunc = `  const loadDriverFromCloud = async () => {
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
  };`;

// Replace functions
const parts = c.split("const saveDriverToCloud = async () => {");
const oldSaveFuncBody = parts[1].split("const resetPlayerSettings = () => {")[0];

c = parts[0] + "\n" + cloudFuncs.replace("const _unused_saveToCloud = async () => {", "") + "\n  const resetPlayerSettings = () => {" + parts[1].split("const resetPlayerSettings = () => {")[1];

// Update buttons layout visually
c = c.replace(/title="Load from Cloud"/g, 'title="Load Local Profile"');
c = c.replace(/title="Save to Cloud"/g, 'title="Save Local Profile"');

// Fix buttons layout so CloudCog and Save have clear texts.
c = c.replace(
  /<button onClick=\{loadDriverFromCloud\} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Load Local Profile"><CloudCog className="w-4 h-4" \/><\/button>\n                        <button onClick=\{saveDriverToCloud\} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition" title="Save Local Profile"><Save className="w-4 h-4" \/><\/button>/,
  '<button onClick={loadDriverFromCloud} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center gap-1.5 text-[11px] font-bold"><CloudCog className="w-3.5 h-3.5" /> Load</button>\n                        <button onClick={saveDriverToCloud} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition flex items-center gap-1.5 text-[11px] font-bold"><Save className="w-3.5 h-3.5" /> Save</button>'
);

fs.writeFileSync('src/App.tsx', c);
