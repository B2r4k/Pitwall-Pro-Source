import fs from 'fs';

let c = fs.readFileSync('src/i18n.ts', 'utf-8');
c = c.replace(/"Checklist": "Kontrol Listesi",/, '"Checklist": "Kontrol Listesi",\n    "Setup Assistant": "Ayar Asistanı",\n    "Calibration (Test Laps)": "Kalibrasyon (Test Turları)",\n    "Dashboard Overview": "Genel Bakış",');

// Ensure the 'Strateji Uzmanı' replacement
c = c.replace(/"Strategy Engine": "Strateji Motoru",/, '"Strategy Engine": "Strateji Motoru",\n    "Strategy Wizard": "Strateji Uzmanı",');


fs.writeFileSync('src/i18n.ts', c);
