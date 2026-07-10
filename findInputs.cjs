const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const matches = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (/<(input|select|textarea)/.test(line)) {
        if (!/dark:bg-/.test(line) && /bg-(white|slate-50|slate-100|slate-200)/.test(line)) {
            matches.push((index + 1) + ": " + line.trim());
        }
    }
});
fs.writeFileSync('badInputs.txt', matches.join('\n'));
