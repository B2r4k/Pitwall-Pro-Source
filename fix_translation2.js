import fs from 'fs';

let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/Backup and sync data to cloud veya cihazlar arası eşitleyin \(Yakında\)/g, "Backup and sync data to cloud or sync between devices (Soon)");

// Also double check Checklist layout to ensure we can scroll nicely or it behaves correctly under Assistant tab.
// I see I've removed `activeTab === 'tyre_analysis'` from the tabButtons earlier, which was already true. But wait.
// In the previous step I forced `activeTab === 'home'` to the front of `activeTab === 'track_setup'`.
// Did I remove `activeTab === 'tyre_analysis'` render block?
// No, I only removed `activeTab === 'calibration'` and `activeTab === 'checklist'`.
// So `activeTab === 'tyre_analysis'` might still be rendered if state is somehow set to that, but there's no button for it.
// Which is fine because its view content is mostly duplicate or covered by Strategy engine. Wait, let's remove it if it's there to clean up code size.

// c = c.replace(/\{activeTab === 'tyre_analysis' && \([\s\S]*?\{activeTab === 'strategy' && \(/, "{activeTab === 'strategy' && (");
// The `tyre_analysis` block is quite big...
// Actually, let's just make sure everything runs fine.

fs.writeFileSync('src/App.tsx', c);
