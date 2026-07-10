const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');

const key = "Are you sure you want to reset driver and car settings to default?";
const val = "Pilot ve araç ayarlarını sıfırlamak istediğinize emin misiniz?";

const trBlockRegex = /(tr:\s*\{)([\s\S]*?)(\n\s*\})/;
const match = i18n.match(trBlockRegex);
if(match) {
  let existingBlock = match[2];
  if(!existingBlock.includes('"' + key + '"') && !existingBlock.includes("'" + key + "'")) {
     existingBlock += ',\\n    "' + key + '": "' + val + '"';
  }
  i18n = i18n.replace(trBlockRegex, '$1' + existingBlock + '$3');
  fs.writeFileSync('src/i18n.ts', i18n);
}
