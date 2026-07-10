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
            let fileChanged = false;
            
            for (let i = 0; i < lines.length; i++) {
                let l = lines[i];
                
                // 1. Missing dark border-slate-200
                if (/className=.*border-slate-200/.test(l) && !l.includes('dark:border-') && !l.includes('border-white')) {
                    l = l.replace('border-slate-200', 'border-slate-200 dark:border-slate-700/60');
                    fileChanged = true;
                }
                // 2. Missing dark border-slate-700
                if (/className=.*border-slate-700/.test(l) && !l.includes('dark:border-')) {
                    if (l.includes('bg-slate-50')) {
                        // wait, if it's border-slate-700 on a light bg, that's weird. Usually border-slate-200 dark:border-slate-700
                        l = l.replace('border-slate-700', 'border-slate-200 dark:border-slate-700');
                        fileChanged = true;
                    }
                }
                // 3. Text color missing
                if (/<(input|textarea|select)/.test(l)) {
                    if (!l.includes('text-slate-') && !l.includes('text-indigo-') && !l.includes('text-white')) {
                        if (l.includes('dark:bg-') || l.includes('bg-slate-50')) {
                            l = l.replace('className="', 'className="text-slate-800 dark:text-slate-100 ');
                            fileChanged = true;
                        }
                    }
                }
                
                lines[i] = l;
            }
            if (fileChanged) fs.writeFileSync(fullPath, lines.join('\n'));
        }
    }
}

scanDir('src');
