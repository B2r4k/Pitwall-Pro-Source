const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('confirm("Are you sure you want to reset driver {t("and")} car settings to default?")', 'confirm(t("Are you sure you want to reset driver and car settings to default?"))');
fs.writeFileSync('src/App.tsx', app);
