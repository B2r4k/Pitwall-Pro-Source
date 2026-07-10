const fs = require('fs');
let c = fs.readFileSync('src/i18n.ts', 'utf-8');

const newTranslations = `
    "Race Preparation Status": "Yarış Hazırlık Durumu",
    "Select a track to begin.": "Başlamak için bir pist seçin.",
    "Enter driver skills for accurate wear.": "Daha doğru aşınma hesabı için sürücü özelliklerini girin.",
    "All systems ready for strategy calculation.": "Tüm sistemler strateji hesaplaması için hazır.",
    "Track Data": "Pist Verisi",
    "Driver Stats": "Sürücü İstatistikleri",
    "Data & Assistant": "Veri & Asistan",
    "Garage & Economy": "Garaj & Ekonomi",
    "Strategy & Track": "Strateji & Pist",
    "In-App Notifications": "Uygulama İçi Bildirimler",
    "Update Notes History": "Güncelleme Notları Geçmişi",
`;

c = c.replace(/tr: \{/, "tr: {" + newTranslations);

fs.writeFileSync('src/i18n.ts', c);
