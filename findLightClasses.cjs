const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const matches = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
    const hasLightBg = /(?<!dark:)bg-(white|slate-50|slate-100|slate-200)\b/.test(line);
    const hasDarkBg = /dark:bg-(slate-[0-9]+|transparent|\[#|indigo-[0-9]+|gray-[0-9]+)/.test(line);
    const hasGradient = /bg-gradient/.test(line);

    if (hasLightBg && !hasDarkBg && !hasGradient) {
        matches.push((index + 1) + ": " + line.trim());
    }
});
fs.writeFileSync('badLightClasses.txt', matches.join('\n'));
