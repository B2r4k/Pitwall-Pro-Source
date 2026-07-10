import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace constants state initialization
c = c.replace("weightPenaltyPerLiter: 0.035", "driverWeight: 80");

// The user is asking "Weight penalty yerine direkt sürucünün weight I yazılsın". So we find where weightPenaltyPerLiter is displayed.
c = c.replace(/weightPenaltyPerLiter: Number\(e.target.value\)/g, "driverWeight: Number(e.target.value)");

c = c.replace(/constants.weightPenaltyPerLiter/g, '(constants.driverWeight * 0.00045)'); // ~0.036 for 80kg

// Rename the tab text to Driver Profile & Car Setup
c = c.replace(/Driver Profile<\/span>/g, "Driver & Tyre Profile</span>");
c = c.replace(/Driver Profile/g, "Driver & Tyre Profile");

// Data statistics take too much height and need black background in dark mode.
c = c.replace(/h-72/g, "h-56"); // smaller height
c = c.replace(/bg-slate-50 dark:bg-slate-800\/20/g, "bg-slate-50 dark:bg-slate-950"); // darker background

fs.writeFileSync('src/App.tsx', c);
