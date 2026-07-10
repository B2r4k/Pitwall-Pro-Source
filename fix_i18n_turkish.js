import fs from 'fs';
let c = fs.readFileSync('src/i18n.ts', 'utf-8');

c = c.replace(
  "'Active Track': 'Aktif Pist',",
  "'Active Track': 'Aktif Pist',\n    'Driver Weight (kg)': 'Sürücü Ağırlığı (kg)',\n    'Weight Penalty (s/L/Lap)': 'Ağırlık Penaltısı (sn/L/Tur)',\n    'Driver & Tyre Profile': 'Sürücü ve Lastik Profili',\n    'AI Assistant': 'Yapay Zeka Asistanı',"
);

fs.writeFileSync('src/i18n.ts', c);
