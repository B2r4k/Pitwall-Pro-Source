const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('content="Configure qualifying {t("and")} race rain probabilities."', 'content={t("Configure qualifying and race rain probabilities.")}');
fs.writeFileSync('src/App.tsx', app);
