const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /className=[\{]?["'`]([^"'`]*)["'`][\}]?/g;
let match;
const classes = new Set();
while ((match = regex.exec(content)) !== null) {
  const cls = match[1].split(/\s+/);
  cls.forEach(c => classes.add(c));
}

console.log("Analyzing missing dark variants for dark backgrounds:");
const matches = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
    // Look for bg-slate-800 or bg-slate-900 that are NOT prefixed with dark:
    // and aren't paired with text-white (buttons are usually allowed to be dark in light mode)
    // Actually, let's just find lines that have 'bg-slate-800' but not 'dark:bg-slate-800'
    const hasDarkBg = /(?<!dark:)bg-slate-(800|900|950)/.test(line);
    const isButton = /<button/.test(line);
    if (hasDarkBg && !isButton) {
        matches.push(index + 1 + ": " + line.trim());
    }
    
    // Look for white backgrounds in dark mode
    const hasLightDarkBg = /dark:bg-(white|slate-50|slate-100)/.test(line);
    if (hasLightDarkBg) {
        matches.push(index + 1 + ": " + line.trim());
    }
});
fs.writeFileSync('badClasses.txt', matches.join('\n'));
