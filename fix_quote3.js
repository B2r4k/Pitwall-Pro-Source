import fs from 'fs';
let cv = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');
cv = cv.replace(/end of the race!'\)/g, 'end of the race!")');
fs.writeFileSync('src/components/ChecklistView.tsx', cv);
