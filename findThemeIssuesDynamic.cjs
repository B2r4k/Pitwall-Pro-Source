const fs = require('fs');
const path = require('path');

function checkFile(file) {
    const c = fs.readFileSync(file, 'utf-8');
    const lines = c.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let l = lines[i];
        if (l.includes('className={')) {
            const clsMatch = l.match(/className=\{`([^`]+)`/);
            if (clsMatch) {
                const classes = clsMatch[1].split(' ');
                
                let hasLightBg = false;
                let hasDarkBg = false;
                let hasLightText = false;
                let hasDarkText = false;
                
                classes.forEach(c => {
                    if (c === 'bg-white' || c === 'bg-slate-50' || c === 'bg-slate-100' || c === 'bg-slate-200' || c === 'bg-slate-300') {
                        hasLightBg = true;
                    }
                    if (c.startsWith('dark:bg-')) hasDarkBg = true;
                    
                    if (c === 'text-slate-800' || c === 'text-slate-900' || c === 'text-slate-700') hasLightText = true;
                    if (c.startsWith('dark:text-')) hasDarkText = true;
                });
                
                if (hasLightBg && !hasDarkBg) {
                    if (!l.includes('bg-white rounded-full') && !l.includes('shadow-sm') && !l.includes('absolute')) {
                        console.log(`Missing Dark BG (dynamic): ${file}:${i+1}: ${l.trim()}`);
                    }
                }
                if (hasLightText && !hasDarkText) {
                    console.log(`Missing Dark Text (dynamic): ${file}:${i+1}: ${l.trim()}`);
                }
            }
        }
    }
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            checkFile(fullPath);
        }
    }
}

scanDir('src');
