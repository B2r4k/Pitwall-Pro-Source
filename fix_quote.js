import fs from 'fs';
let cv = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');
cv = cv.replace(/<p>\{t\('You\\\\'re almost there\./g, "<p>{t('You\\'re almost there.");
fs.writeFileSync('src/components/ChecklistView.tsx', cv);
