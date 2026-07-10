const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/let scrapedData = \{\};/, 'let scrapedData: any = {};');
app = app.replace(/if \(dbIds\.includes\(nextRace\.trackId\)\) \{/, 'if (dbIds.includes(nextRace.id)) {');
app = app.replace(/matchedId = nextRace\.trackId;/, 'matchedId = nextRace.id;');
fs.writeFileSync('src/App.tsx', app);

let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');
const lines = i18n.split('\n');
i18n = lines.filter((line, index) => {
   if (line.includes('"In-App Notifications"')) {
      if (index > 100) return false;
   }
   if (line.includes('"Update Notes History"')) {
      if (index > 100) return false;
   }
   return true;
}).join('\n');
fs.writeFileSync('src/i18n.ts', i18n);
