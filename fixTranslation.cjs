const fs = require('fs');

let cal = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');
cal = cal.replace(/Enter past race data to precisely calibrate your car and driver stats\. uygulamanın sizin araba ve pilotunuza göre hassas kalibrasyon yapmasını sağlayın\./g, "Enter past race data to precisely calibrate your car and driver stats.");
fs.writeFileSync('src/components/CalibrationView.tsx', cal);

let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');
i18n = i18n.replace(/"Enter past race data to precisely calibrate your car and driver stats\. uygulamanın sizin araba ve pilotunuza göre hassas kalibrasyon yapmasını sağlayın\.":/g, '"Enter past race data to precisely calibrate your car and driver stats.":');
i18n = i18n.replace(/"Add your stints\. At least 1 dry compound is mandatory\. ekleyin\. Kuru zemin için 1 tür zorunludur\.":/g, '"Add your stints. At least 1 dry compound is mandatory.":');

fs.writeFileSync('src/i18n.ts', i18n);

let str = fs.readFileSync('src/components/TrackAnalysisView.tsx', 'utf-8');
if (str.includes("Add your stints. At least 1 dry compound is mandatory. ekleyin. Kuru zemin için 1 tür zorunludur.")) {
    str = str.replace(/Add your stints\. At least 1 dry compound is mandatory\. ekleyin\. Kuru zemin için 1 tür zorunludur\./g, "Add your stints. At least 1 dry compound is mandatory.");
    fs.writeFileSync('src/components/TrackAnalysisView.tsx', str);
}
let cal2 = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');
if (cal2.includes("Add your stints. At least 1 dry compound is mandatory. ekleyin. Kuru zemin için 1 tür zorunludur.")) {
    cal2 = cal2.replace(/Add your stints\. At least 1 dry compound is mandatory\. ekleyin\. Kuru zemin için 1 tür zorunludur\./g, "Add your stints. At least 1 dry compound is mandatory.");
    fs.writeFileSync('src/components/CalibrationView.tsx', cal2);
}

