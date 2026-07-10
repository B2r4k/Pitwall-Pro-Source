const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const matches = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
    // Has bg-white, bg-slate-50, or bg-slate-100
    // But does not have any dark:bg- class
    if (/(?<!hover:|dark:)bg-(white|slate-50|slate-100|slate-200)/.test(line) && !/dark:bg-/.test(line)) {
        // Exclude inputs with bg-white, just looking for cards
        matches.push((index + 1) + ": " + line.trim());
    }
});
fs.writeFileSync('allLightMissingDark.txt', matches.join('\n'));
