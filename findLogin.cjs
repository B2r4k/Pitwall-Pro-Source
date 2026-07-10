const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

const loginLines = [];
let capture = false;
lines.forEach((line, i) => {
    if (line.includes('Giriş Yap / Kayıt Ol')) capture = true;
    if (capture) {
        loginLines.push(`${i+1}: ${line.trim()}`);
        if (line.includes('Google ile Giriş Yap')) capture = false;
    }
});
fs.writeFileSync('login-tab.txt', loginLines.join('\n'));
