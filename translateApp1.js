import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/\{activeTrack\.name\}/g, "{t(activeTrack.name)}");
c = c.replace(/\{t\.name\}/g, "{t(t.name)}");
c = c.replace(/\{player\.name \|\| 'Driver 1'\}/g, "{player.name || t('Driver 1')}");

fs.writeFileSync('src/App.tsx', c);
