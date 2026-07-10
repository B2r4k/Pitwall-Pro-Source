const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace('if (!isAuto) alert(`☁️ Liand Calendar Sync: Next race is ${race.raceName}. Track mapped to ${matchedId.toUpperCase()}.`);', 
'if (!isAuto) { setSyncStatus(t("Liand Calendar Sync:") + " " + race.raceName); setTimeout(() => setSyncStatus(""), 4000); }');

app = app.replace('alert("Liand feed unavailable or error occurred.");', 
'{ setSyncStatus(t("Liand feed unavailable or error occurred.")); setTimeout(() => setSyncStatus(""), 4000); }');

fs.writeFileSync('src/App.tsx', app);
