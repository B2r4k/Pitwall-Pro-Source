const fs = require('fs');
let c = fs.readFileSync('src/i18n.ts', 'utf-8');

const missingTR = {
  "Analytical Calibration Suite": "Analitik Kalibrasyon Suiti",
  "Enter past race data to precisely calibrate your car and driver stats. uygulamanın sizin araba ve pilotunuza göre hassas kalibrasyon yapmasını sağlayın.": "Araba ve pilot kalibrasyonunuzu hassas bir şekilde yapmak için geçmiş yarış verilerini girin.",
  "Past Track": "Geçmiş Pist",
  "Rain Conditions?": "Yağmur Koşulları?",
  "Active": "Aktif",
  "Dry Race": "Kuru Yarış",
  "Estimated Rain Probabilities (%)": "Tahmini Yağmur İhtimali (%)",
  "Pit Strategy & Stints": "Pit Stratejisi ve Stintler",
  "Add your stints. At least 1 dry compound is mandatory. ekleyin. Kuru zemin için 1 tür zorunludur.": "Stintlerinizi ekleyin. Kuru zemin için en az 1 tür zorunludur.",
  "Compound": "Lastik",
  "Laps (Stint)": "Tur (Stint)",
  "Wear (%)": "Aşınma (%)",
  "Fuel (L)": "Yakıt (L)",
  "Estimated Average": "Tahmini Ortalama",
  "New Stint (Pit)": "Yeni Stint (Pit)",
  "Overall Race Conditions": "Genel Yarış Koşulları",
  "Avg Temp (°C)": "Ort. Sıcaklık (°C)",
  "Risk Lvl": "Risk Seviyesi",
  "Evaluate Race Data": "Yarış Verilerini Değerlendir",
  "Extracted Base Values": "Çıkarılan Temel Değerler",
  "Fuel Burn": "Yakıt Tüketimi",
  "Wear Factor": "Aşınma Çarpanı",
  "AI Engineer Insight": "Yapay Zeka Mühendis Görüşü",
  "Accept and Apply to Profile": "Kabul Et ve Profile Uygula",
  "Values will be synced to your account.": "Değerler hesabınızla senkronize edilecektir.",
  "Need help preparing for the race?": "Yarışa hazırlanmak için yardıma mı ihtiyacınız var?",
  "Race Assistant": "Yarış Asistanı",
  "All checks complete! Great job, your car setup and strategy are ready. Trust your analysis and good luck out there on the track!": "Tüm kontroller tamamlandı! Harika iş çıkardınız, araç ve stratejiniz hazır. Analizinize güvenin ve pistte başarılar!",
  "You're almost there. Double check your tyre strategy based on the track temperature. It often drops towards the end of the race!": "Neredeyse bitti. Pist sıcaklığına bağlı olarak lastik stratejinizi tekrar kontrol edin. Sıcaklıklar genellikle yarışın sonlarına doğru düşer!",
  "Welcome to race day! Start by configuring your": "Yarış gününe hoş geldiniz! Ayarlamaya başlayın",
  "Track Setup": "Pist Ayarları",
  "to pull in the correct Track data, then check your": "doğru Pist verilerini çekmek için, ardından kontrol edin",
  "Calibration": "Kalibrasyon",
  "limits.": "sınırlarınızı.",
  "Track Selection": "Pist Seçimi",
  "Total Race Laps:": "Toplam Yarış Turu:",
  "Fetch F1 Calendar": "F1 Takvimini Getir",
  "Fetching liand calendar...": "F1 Takvimi getiriliyor...",
  "Language": "Dil",
  "Select your preferred language": "Tercih ettiğiniz dili seçin",
  "Check weather forecast for Q and R": "Sıralama ve Yarış için hava tahminini kontrol et",
  "Adjust car setup for current temperature": "Mevcut sıcaklık için araç ayarını yap",
  "Set driver risk/aggression": "Sürücü risk/agresifliğini ayarla",
  "Calculate and set starting fuel": "Başlangıç yakıtını hesapla ve ayarla",
  "Choose starting tyre compound": "Başlangıç lastik türünü seç",
  "Confirm pit strategy (stints/laps)": "Pit stratejisini onayla (stintler/turlar)",
  "Check and configure secondary strategy for rain": "Yağmur için ikincil stratejiyi kontrol et ve yapılandır",
  "Verify part wear and replace if necessary": "Parça aşınmalarını kontrol et ve gerekiyorsa değiştir",
  "Double check test lap data": "Test turu verilerini iki kez kontrol et"
};

let appendStr = '';
for (const key in missingTR) {
  if (!c.includes(key)) {
     appendStr += '    "' + key + '": "' + missingTR[key] + '",\\n';
  }
}

// Find the last item of tr {}
let c2 = c.replace(/    "Double check test lap data": "Test turu verilerini iki kez kontrol et"\\n  \\}/, '    "Double check test lap data": "Test turu verilerini iki kez kontrol et",\\n' + appendStr + '  }');

fs.writeFileSync('src/i18n.ts', c2.replace(/\\n/g, '\n'));
