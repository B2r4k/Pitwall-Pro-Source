import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const tOld = `<ChecklistView currentUser={currentUser} goToTab={(tab) => {`;
const tNew = `<ChecklistView currentUser={currentUser} appState={{ track: activeTrack, player, weather }} goToTab={(tab) => {`;
c = c.replace(tOld, tNew);

fs.writeFileSync('src/App.tsx', c);
