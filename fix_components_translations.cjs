const fs = require('fs');

let track = fs.readFileSync('src/components/TrackAnalysisView.tsx', 'utf-8');

const reps = [
  ['>Est. Time Cost<', '>{t("Est. Time Cost")}<'],
  ['>Pits:<', '>{t("Pits:")}<'],
  ['>Fuel:<', '>{t("Fuel:")}<'],
  ['>RISKY<', '>{t("RISKY")}<'],
  ['>Safe<', '>{t("Safe")}<'],
  ['>No track selected for analysis.<', '>{t("No track selected for analysis.")}<'],
  ['>Total Race Distance<', '>{t("Total Race Distance")}<'],
  ['>Pit Stop Cost<', '>{t("Pit Stop Cost")}<'],
  ['>Avg Fuel Consumption<', '>{t("Avg Fuel Consumption")}<'],
  ['>Highest Wear<', '>{t("Highest Wear")}<'],
  ['>Pit Time Stats<', '>{t("Pit Time Stats")}<'],
];

for (const [rA, rB] of reps) {
  track = track.split(rA).join(rB);
}

fs.writeFileSync('src/components/TrackAnalysisView.tsx', track);

// And CalibrationView
let calib = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');
const calibReps = [
  ['>Stints<', '>{t("Stints")}<'],
  ['>Laps<', '>{t("Laps")}<'],
  ['>Estimated Base Wear<', '>{t("Estimated Base Wear")}<'],
  ['>Estimated Fuel Cost<', '>{t("Estimated Fuel Cost")}<'],
];
for (const [rA, rB] of calibReps) {
  calib = calib.split(rA).join(rB);
}
fs.writeFileSync('src/components/CalibrationView.tsx', calib);
