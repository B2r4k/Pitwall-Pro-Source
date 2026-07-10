const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
const str1 = 'content="These suggestions are specifically estimated based on the track characteristics {t("and")} air temperature."';
app = app.replace(str1, 'content={t("These suggestions are specifically estimated based on the track characteristics and air temperature.")}');

const str2 = 'content="You can input data manually {t("and")} make calculations without importing anything."';
app = app.replace(str2, 'content={t("You can input data manually and make calculations without importing anything.")}');

const str3 = '{t("Dynamic recommendations based on active track {t("and")} weather")}';
app = app.replace(str3, '{t("Dynamic recommendations based on active track and weather")}');

fs.writeFileSync('src/App.tsx', app);
