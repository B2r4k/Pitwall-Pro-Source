import fs from 'fs';
let content = fs.readFileSync('src/components/TrackAnalysisView.tsx', 'utf-8');

const replacements = {
  "Detaylı Pist & Lastik Analizi": "Detailed Track & Tyre Analysis",
  "Yakıt Profili": "Fuel Profile",
  "Tur Başına Tüketim": "Consumption per Lap",
  "Litre": "Liters",
  "Tam Yarış İhtiyacı<br/><span className=\"text-xs text-slate-400\">\\(Pit stopsuz\\)</span>": "Full Race Requirement<br/><span className=\"text-xs text-slate-400\">(Without pit stop)</span>",
  "Ağırlık Etkisi<br/><span className=\"text-xs text-slate-400\">": "Weight Impact<br/><span className=\"text-xs text-slate-400\">",
  "tur başına": "per lap",
  "Pist Şartları": "Track Conditions",
  "Ortalama Sıcaklık": "Average Temp",
  "Aşınma Seviyesi": "Wear Severity",
  "Stresi Tetikleyen Modifiye<br/><span className=\"text-xs text-slate-400\">Pilot ve sıcaklık dahil</span>": "Stress Modifier<br/><span className=\"text-xs text-slate-400\">Including driver and temp</span>",
  "%/Tur": "%/Lap",
  "Hamur Aşınma Projeksiyonu": "Compound Wear Projection",
  "/tur</span></td>": "/lap</span></td>",
  "tur</span></td>": "laps</span></td>",
  "Hamur": "Compound",
  "İdeal Sıc.": "Ideal Temp",
  "Tahmini Aşınma": "Est. Wear",
  "Maks Güvenli Tur": "Max Safe Laps",
  "Temel Tempo Farkı": "Pace Pen. (Base)",
  "Durum": "Status",
  "UYGUN": "SUITABLE",
  "RİSKLİ": "RISKY",
  "ÇOK ISINIR": "TOO HOT",
  "GEREKSİZ": "USELESS",
  "Maksimum güvenli tur, lastiklerin %90 aşınma sınırına ulaştığı nokta olarak hesaplanmıştır. Kırmızıya dönen turlarda patlama riski oluşur. Ortalama sıcaklık, lastiğin ideal derecesinin üzerindeyse aşınma katlanarak artar.": "Max safe laps are calculated off a 90% wear limit. Beyond that, puncturing is highly likely. If the average temperature sits above the compound's ideal temperature, wear scales exponentially."
};

for (const [tr, en] of Object.entries(replacements)) {
  content = content.replace(new RegExp(tr, 'g'), en);
}
fs.writeFileSync('src/components/TrackAnalysisView.tsx', content);
console.log('TrackAnalysisView translated');
