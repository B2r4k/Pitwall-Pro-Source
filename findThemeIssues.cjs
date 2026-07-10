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
                const hasLightBg = /(?<!hover:|dark:)bg-(white|slate-50|slate-100)\b/.test(line);
                const hasDarkBg = /dark:bg-/.test(line);
                if (hasLightBg && !hasDarkBg) {
                    // Ignore some safe patterns
                    if (!line.includes('bg-white rounded-full') && !line.includes('bg-white/')) {
                        console.log(`LIGHT-NO-DARK ${fullPath}:${index+1}: ${line.trim()}`);
                    }
                }
                
                const hasDarkBox = /(?<!dark:|hover:)bg-(slate-700|slate-800|slate-900)\b/.test(line);
                if (hasDarkBox && !line.includes('text-white') && !line.includes('bg-gradient')) {
                   // A box that is unconditionally dark but doesn't have text-white
                   // Wait, maybe it has text-white on a parent? Let's print them anyway
                   console.log(`DARK-NO-LIGHT ${fullPath}:${index+1}: ${line.trim()}`);
                }
            });
        }
    }
}

scanDir('src');
