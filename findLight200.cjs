const fs = require('fs');
const path = require('path');

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (/className=.*bg-slate-200/.test(line) && !line.includes('dark:bg-')) {
                   console.log(`LIGHT200 ${fullPath}:${index+1}: ${line.trim()}`);
                }
            });
        }
    }
}

scanDir('src');
