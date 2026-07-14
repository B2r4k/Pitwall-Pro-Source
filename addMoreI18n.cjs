const fs = require('fs');
let c = fs.readFileSync('src/i18n.ts', 'utf-8');

const newTranslations = `
    "Driver Fatigue Warning": "Sürücü Yorgunluğu Uyarısı",
    "Your driver's stamina is very low. They might make mistakes towards the end of the race.": "Sürücünüzün kondisyonu çok düşük. Yarış sonlarına doğru hata yapma riski yüksek.",
    "Cold Track Conditions": "Soğuk Pist Koşulları",
    "Track temperature is very low. It will be difficult to warm up harder tyre compounds.": "Pist sıcaklığı oldukça düşük. Sert lastik hamurlarını ısıtmakta zorlanabilirsiniz.",
    "Hot Track Conditions": "Sıcak Pist Koşulları",
    "Track temperature is very high. Tyres will overheat and degrade much faster than usual.": "Pist sıcaklığı çok yüksek. Lastikler aşırı ısınacak ve normalden daha hızlı aşınacaktır.",
    "Extreme Risk in Rain": "Yağmurda Yüksek Risk",
    "Taking high risks in wet conditions drastically increases the chance of a crash.": "Islak zeminde yüksek risk almak kaza ihtimalini büyük ölçüde artırır.",
    "High Fuel Consumption": "Yüksek Yakıt Tüketimi",
    "Your car consumes a lot of fuel. Be careful with tank limits on longer stints.": "Aracınız ortalamanın üzerinde yakıt tüketiyor. Uzun stintlerde depo limitlerine dikkat edin.",
`;

c = c.replace(/tr: \{/, 'tr: {' + newTranslations);
fs.writeFileSync('src/i18n.ts', c);
