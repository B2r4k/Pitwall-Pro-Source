const fs = require('fs');
let c = fs.readFileSync('src/i18n.ts', 'utf-8');

const t = {
  "driver": "Sürücü",
  "car": "Araç",
  "track": "Pist",
  "weather": "Hava",
  "risks": "Riskler",
  "Ignore filters on Auto Sync": "Oto-Sync Filtrelerini Yoksay",
  "When auto-sync runs, it will fetch and apply everything.": "Oto-sync çalıştığında tüm verileri çeker ve uygular.",
  "Data Filters": "Veri Filtreleri"
};

let trBlock = c.match(/tr: \{([\s\S]*?)\}/)[1];

for (let en in t) {
   let tr = t[en];
   if (!trBlock.includes('"' + en + '"')) {
       trBlock += '\\n    "' + en + '": "' + tr + '",';
   }
}

c = c.replace(/tr: \{[\s\S]*?\}/, "tr: {" + trBlock + "\\n  }");
fs.writeFileSync('src/i18n.ts', c);
