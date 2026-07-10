const fs = require('fs');

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

const additions = {
    "Initializing Workspace...": "Çalışma Alanı Başlatılıyor...",
    "Checking for updates and syncing configurations.": "Güncellemeler kontrol ediliyor ve yapılandırmalar senkronize ediliyor.",
    "Please Wait": "Lütfen Bekleyin",
    "Warming up the tyres...": "Lastikler ısıtılıyor...",
    "Filling the fuel tank...": "Yakıt deposu dolduruluyor...",
    "Bribing the stewards...": "Hakemlere rüşvet veriliyor...",
    "Analyzing telemetry data...": "Telemetri verileri analiz ediliyor...",
    "Complaining on the team radio...": "Takım radyosunda şikayet ediliyor...",
    "Calculating optimum pit strategies...": "Optimum pit stratejileri hesaplanıyor...",
    "Checking weather radars...": "Hava durumu radarları kontrol ediliyor...",
    "Adjusting front wing angles...": "Ön kanat açıları ayarlanıyor...",
    "Preparing the pit crew...": "Pit ekibi hazırlanıyor...",
    "Installing new chassis...": "Yeni şasi monte ediliyor...",
    "Reviewing track limits...": "Pist sınırları gözden geçiriliyor...",
    "Drinking energy drinks...": "Enerji içecekleri içiliyor...",
    "Listening to the engine sound...": "Motor sesi dinleniyor...",
    "Setting up the motorhome...": "Karavan kuruluyor...",
    "Calibrating sensors...": "Sensörler kalibre ediliyor...",
    "Washing the car...": "Araba yıkanıyor...",
    "Cleaning the track...": "Pist temizleniyor...",
    "Building empires...": "İmparatorluklar kuruluyor..."
};

let trBlockStart = i18n.indexOf('tr: {');
if (trBlockStart !== -1) {
    let insertPos = trBlockStart + 5;
    let newEntries = Object.entries(additions).map(([k, v]) => `    "${k}": "${v}",\n`).join('');
    i18n = i18n.slice(0, insertPos) + '\n' + newEntries + i18n.slice(insertPos);
    fs.writeFileSync('src/i18n.ts', i18n);
    console.log("Translations added.");
}
