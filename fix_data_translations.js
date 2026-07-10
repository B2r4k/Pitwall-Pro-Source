import fs from 'fs';
let c = fs.readFileSync('src/data.ts', 'utf-8');
c = c.replace(/'Montreal \(Kanada\)'/, "'Montreal'");
c = c.replace(/'Melbourne \(Avustralya\)'/, "'Melbourne'");
c = c.replace(/'Sepang \(Malezya\)'/, "'Sepang'");
c = c.replace(/'Sakhir \(Bahreyn\)'/, "'Sakhir'");
c = c.replace(/'Barcelona \(Spain\)'/, "'Barcelona'");
c = c.replace(/'Monako'/, "'Monaco'");
c = c.replace(/'Silverstone \(İngiltere\)'/, "'Silverstone'");
c = c.replace(/'-- Custom Track \(Manual\) --'/, "'Custom Track'");
fs.writeFileSync('src/data.ts', c);

let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');
i18n = i18n.replace(/"Strategy Engine": "Strateji Motoru",/, '"Strategy Engine": "Strateji Motoru",\n    "Strategy Wizard": "Strateji Uzmanı",\n    "Montreal": "Montreal (Kanada)",\n    "Melbourne": "Melbourne (Avustralya)",\n    "Sepang": "Sepang (Malezya)",\n    "Sakhir": "Sakhir (Bahreyn)",\n    "Barcelona": "Barcelona (İspanya)",\n    "Monaco": "Monako",\n    "Silverstone": "Silverstone (İngiltere)",\n    "Custom Track": "-- Özel Pist (Manuel) --",\n    "Dashboard Overview": "Genel Bakış",');
fs.writeFileSync('src/i18n.ts', i18n);
