const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const matches = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
    const hasLightBg = /(?<!hover:|dark:)bg-(white|slate-50|slate-100)\b/.test(line);
    const hasDarkBg = /dark:bg-/.test(line);

    if (hasLightBg && !hasDarkBg) {
        matches.push((index + 1) + ": " + line.trim());
    }
});
fs.writeFileSync('badLightClasses2.txt', matches.join('\n'));
