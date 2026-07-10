const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');

const t = {
  "Smart Setup Assistant": "Akıllı Setup Asistanı",
  "Dynamic recommendations based on active track and weather": "Aktif pist ve hava durumuna göre dinamik öneriler",
  "Wings (FW/RW)": "Kanat (FW/RW)",
  "Hard": "Sert",
  "Medium": "Orta",
  "Increase downforce in high temperature": "Yüksek sıcaklıkta yere basma kuvvetini artır",
  "Acceleration focus": "Hızlanma odaklı",
  "Engine": "Motor",
  "Suspension": "Süspansiyon",
  "Corner balance focus": "Viraj denge odaklı",
  "Setup Note:": "Kurulum Notu:",
  "Calculations automatically adapt using the temperature": "Hesaplamalar sıcaklığı",
  "and": "ve",
  "data and adapts accordingly. Driver skills affect suspension travel.": "verilerini kullanarak otomatik uyarlanır. Pilot yetenekleri süspansiyon esnekliğini etkiler.",
  "Fast / Very High Wear": "Hızlı / Çok Yüksek Aşınma",
  "Extreme Wear": "Aşırı Aşınma",
  "Balanced": "Dengeli",
  "Durable": "Dayanıklı",
  "Highly Durable": "Yüksek Dayanıklı",
  "Extremely Durable": "Aşırı Dayanıklı",
  "Good": "İyi",
  "Bad": "Kötü",
  "Focus": "Odaklanma (Focus)",
  "Experience": "Tecrübe (Experience)",
  "Calculated penalty per liter:": "Litre başına hesaplanan zaman kaybı:",
  "Refuel Rate (L/s)": "Yakıt Dolum Hızı (L/s)",
  "Active Track": "Aktif Pist",
  "Fuel per Lap": "Tur Başına Yakıt",
  "Pit Stop Parameter": "Pit Stop Parametresi",
  "Base:": "Baz:",
  "sec": "sn",
  "Fastest (Recommended)": "En Hızlı (Önerilen)",
  "Inspecting": "İnceleniyor...",
  "Overwear Risk": "Aşırı Aşınma Riski",
  "Distance:": "Mesafe:",
  "Wear:": "Aşınma (Wear):",
  "Fuel:": "Yakıt (Fuel):",
  "Strategy Engine Recommendation": "Strateji Sisteminin Yorumu",
  "AI Insight": "Yapay Fikir",
  "Recommended": "Önerilen",
  "Confirm & Process": "Onayla & Sisteme İşle",
  "Cancel": "İptal",
  "Detected Rain Probabilities (%)": "Tespit Edilen Yağmur İhtimalleri (%)",
  "Est. Time Cost": "Tahmini Zaman Bedeli",
  "Pits:": "Pit Sayısı:",
  "RISKY": "RİSKLİ",
  "Safe": "Güvenli",
  "No track selected for analysis.": "Analiz için pist seçilmedi.",
  "Total Race Distance": "Toplam Yarış Mesafesi",
  "Pit Stop Cost": "Pit Stop Maliyeti",
  "Avg Fuel Consumption": "Ort. Yakıt Tüketimi",
  "Highest Wear": "En Yüksek Aşınma",
  "Pit Time Stats": "Pit Süresi İstatistikleri",
  "Stints": "Stintler",
  "Laps": "Tur",
  "Estimated Base Wear": "Tahmini Baz Aşınma",
  "Estimated Fuel Cost": "Tahmini Yakıt Bedeli"
};

const trBlockRegex = /(tr:\s*\{)([\s\S]*?)(\n\s*\})/;
const match = i18n.match(trBlockRegex);
if(match) {
  let existingBlock = match[2];
  for(const key of Object.keys(t)) {
     if(!existingBlock.includes('"' + key + '"') && !existingBlock.includes("'" + key + "'")) {
        existingBlock += ',\\n    "' + key + '": "' + t[key] + '"';
     }
  }
  i18n = i18n.replace(trBlockRegex, '$1' + existingBlock + '$3');
  fs.writeFileSync('src/i18n.ts', i18n);
  console.log("i18n updated");
}
