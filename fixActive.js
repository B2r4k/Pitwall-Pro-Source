import fs from 'fs';
let c = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');
c = c.replace('<CloudRain className="w-4 h-4" /> {rainEnabled ? "{t("Active")}" : "{t("Dry Race")}"}',
              '<CloudRain className="w-4 h-4" /> {rainEnabled ? t("Active") : t("Dry Race")}');
fs.writeFileSync('src/components/CalibrationView.tsx', c);
