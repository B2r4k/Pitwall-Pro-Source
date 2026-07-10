const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove ChecklistView import
c = c.replace(/import ChecklistView from '\.\/components\/ChecklistView';\n/, "");

// Remove ChecklistView component block
const checkRegex = /<ChecklistView currentUser=\{currentUser\} appState=\{\{ track: activeTrack, player, weather \}\} goToTab=\{\(tab\) => \{[\s\S]*?\}\} \/>/;
c = c.replace(checkRegex, "");

fs.writeFileSync('src/App.tsx', c);
