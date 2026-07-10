const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.split('{t("and")}').join('and');
fs.writeFileSync('src/App.tsx', app);
