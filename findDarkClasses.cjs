const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const matches = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
    const hasDarkBg = /(?<!dark:)bg-(slate-700|slate-800|slate-900)\b/.test(line);
    const hasGradient = /bg-gradient/.test(line);

    if (hasDarkBg && !hasGradient) {
        matches.push((index + 1) + ": " + line.trim());
    }
});
fs.writeFileSync('badDarkClasses.txt', matches.join('\n'));
