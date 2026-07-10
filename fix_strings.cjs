const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const replacements = [
  ['"Next Race"', 't("Next Race")'],
  ['>Dashboard Overview<', '>{t("Dashboard Overview")}<'],
  ['>Track Selection<', '>{t("Track Selection")}<'],
  ['>Total Race Laps:<', '>{t("Total Race Laps:")}<'],
  ['>Track Temperature<', '>{t("Track Temperature")}<'],
  ['>Base Wear<', '>{t("Base Wear")}<'],
  ['>Driver Profile<', '>{t("Driver Profile")}<'],
  ['"Driver & Car Settings"', 't("Driver & Car Settings")'],
  ['>Ignore Stats (Neutral)<', '>{t("Ignore Stats (Neutral)")}<'],
  ['>Driver Aggression<', '>{t("Driver Aggression")}<'],
  ['>Tyre Supplier<', '>{t("Tyre Supplier")}<'],
  ['"Strategy Wizard"', 't("Strategy Wizard")'],
  ['"Strategy Engine"', 't("Strategy Engine")'],
  ['>All Valid Strategies<', '>{t("All Valid Strategies")}<'],
  ['>Selected Strategy:<', '>{t("Selected Strategy:")}<'],
  ['>Relative Time Cost:<', '>{t("Relative Time Cost:")}<'],
  ['"Checklist"', 't("Checklist")'],
  ['"Setup Assistant"', 't("Setup Assistant")'],
  ['"Track Setup & Car"', 't("Track Setup & Car")'],
  ['>Track & Conditions<', '>{t("Track & Conditions")}<'],
];

for (const [search, replace] of replacements) {
    // using split join to replace all occurrences
    app = app.split(search).join(replace);
}

fs.writeFileSync('src/App.tsx', app);
