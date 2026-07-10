import fs from 'fs';

let c = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');

c = c.replace(/import \{ calculateBaseFuel, calculateBaseWearMultiplier \} from '\.\.\/utils\/calculator';/, "import { calculateBaseFuel, calculateBaseWearMultiplier } from '../utils/calculator';\\nimport { t } from '../i18n';");

const replacements = [
  "Analytical Calibration Suite",
  "Enter past race data to precisely calibrate your car and driver stats. uygulamanın sizin araba ve pilotunuza göre hassas kalibrasyon yapmasını sağlayın.",
  "Past Track",
  "Rain Conditions?",
  "Active",
  "Dry Race",
  "Estimated Rain Probabilities (%)",
  "Pit Strategy & Stints",
  "Add your stints. At least 1 dry compound is mandatory. ekleyin. Kuru zemin için 1 tür zorunludur.",
  "Compound",
  "Laps (Stint)",
  "Wear (%)",
  "Fuel (L)",
  "Estimated Average",
  "New Stint (Pit)",
  "Overall Race Conditions",
  "Avg Temp (°C)",
  "Risk Lvl",
  "Evaluate Race Data",
  "Extracted Base Values",
  "Fuel Burn",
  "Wear Factor",
  "AI Engineer Insight",
  "Accept and Apply to Profile",
  "Values will be synced to your account."
];

for(const text of replacements) {
  // To avoid breaking code context, we will be using regex to safely replace strings inside JSX curly brackets.
  // We can just use split and join!
  if (c.includes('>' + text + '<')) {
     c = c.split('>' + text + '<').join('>{t("' + text + '")}<');
  } 
  else if (c.includes(text + ' <')) { // e.g. Analytical Calibration Suite <Tooltip
     c = c.split(text + ' <').join('{t("' + text + '")} <');
  }
  else if (c.includes('> ' + text)) { // e.g. ><CloudRain /> Active
     c = c.split('> ' + text).join('> {t("' + text + '")}');
  }
  else {
     // general replace if it's text
     c = c.split(text).join('{t("' + text + '")}');
  }
}

// Ensure we don't break string literals
c = c.split('"{t(\\"Active\\")}"').join('t("Active")');
c = c.split('"{t(\\"Dry Race\\")}"').join('t("Dry Race")');
c = c.split('{t("{t(\\"Add your stints. At least 1 dry compound is mandatory. ekleyin. Kuru zemin için 1 tür zorunludur.\\")}")}').join('{t("Add your stints. At least 1 dry compound is mandatory. ekleyin. Kuru zemin için 1 tür zorunludur.")}');
c = c.split('<div className="w-full p-1.5 text-sm bg-indigo-50/50 text-indigo-400 border dark:border-slate-700 border-indigo-100 rounded text-center font-mono cursor-not-allowed" title={t("Estimated Average")}>{displayFuel}</div>').join('<div className="w-full p-1.5 text-sm bg-indigo-50/50 text-indigo-400 border dark:border-slate-700 border-indigo-100 rounded text-center font-mono cursor-not-allowed" title={t("Estimated Average")}>{displayFuel}</div>');

fs.writeFileSync('src/components/CalibrationView.tsx', c);
