const fs = require('fs');

// 1. i18n additions
let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');
const missingTR = {
  "Race Analysis & Pre-Race Checklist": "Yarış Analizi ve Yarış Öncesi Kontrol Listesi",
  "Calibration and test lap evaluator.": "Kalibrasyon ve test turu değerlendiricisi.",
  "Open Assistant": "Asistanı Aç",
  "Error connecting to AI Assistant.": "AI Asistanı'na bağlanırken hata oluştu.",
  "E.g. What should I do if it rains at lap 20?": "Örn. 20. turda yağmur yağarsa ne yapmalıyım?",
  "Error!": "Hata!",
  "Settings successfully calibrated to Profile!": "Ayarlar başarıyla Profil'e kalibre edildi!",
  "Under GPRO rules, you may only use one type of dry compound per race. Other stints will be synced automatically.": "GPRO kuralları gereği, maç başına sadece 1 tür kuru hava lastiği kullanabilirsiniz. Mevcut stintleriniz otomatik güncellenecek.",
  "Incorrect number of laps entered.": "Geçersiz tur sayısı girildi.",
  "🚨 Your tyre wear factor is very high! You reached the puncture limits in some stints. Lower driver aggression.": "🚨 Lastik aşınma faktörünüz çok yüksek! Bazı stintlerde patlama sınırına ulaşılmış. Sürücü riskini/agresifliğini düşürün.",
  "✨ Excellent tyre economy. Wear is well below average.": "✨ Mükemmel lastik ekonomisi. Aşınma ortalamanın oldukça altında.",
  "📊 Your tyre wear is around the standard average.": "📊 Lastik aşınmanız standart ortalamalarda.",
  "⛽ Your base fuel consumption is very high. Consider optimizing setups or engine updates.": "⛽ Bazen yakıt tüketiminiz çok yüksek. Araç ayarlarını veya motor güncellemelerini düşünün.",
  "⚠️ Your stint laps sum up to more than the track laps! Check your inputs.": "⚠️ Stint turlarınızın toplamı pist turundan fazla! Girdilerinizi kontrol edin.",
  "⚠️ You probably DNF'd or crashed, you mapped fewer laps than the track total.": "⚠️ Muhtemelen yarış dışı kaldınız, pist toplamından daha az tur girdiniz.",
  "💧 Despite heavy rain probability, you stubbornly stayed on dry tyres! The high wear reflects this loss of grip.": "💧 Yüksek yağmur ihtimaline rağmen kuru hava lastiğinde kalmışsınız! Aşınma verileri bu tutunma eksikliğini yansıtıyor.",
  "🌤️ You played it too safe with Rain tyres in mostly dry conditions, causing heavy wear and time loss.": "🌤️ Çoğunlukla kuru hava olan koşullarda fazla güvenli oynayıp Yağmur lastiği kullanmışsınız, yüksek aşınma ve zaman kaybı yaşanmış.",
  "🌦️ Your tyre selection in transition periods looks reasonable.": "🌦️ Geçiş periyotlarındaki lastik seçiminiz makul görünüyor.",
  "Auto Translate": "Otomatik Çeviri",
  "Display in other languages automatically": "Uygulama dilini tarayıcıya göre otomatik ayarla",
  "Enable automatic local translation based on your browser language.": "Tarayıcı dilinize göre otomatik yerel çeviriyi etkinleştir.",
  "AI Assistant": "Yapay Zeka Asistanı",
  "Setup Assistant": "Ayar Asistanı"
};

let appendStr = '';
for (const key in missingTR) {
  if (!i18n.includes('"' + key + '"') && !i18n.includes("'" + key + "'")) {
     appendStr += '    "' + key + '": "' + missingTR[key] + '",\n';
  }
}
// put before the last property
let targetMatch = /    "Language & Translation": "Dil ve Çeviri"[^\}]+  \}/s;
if (i18n.match(targetMatch)) {
   let replacing = i18n.match(targetMatch)[0];
   let updated = replacing.replace('    "Language & Translation": "Dil ve Çeviri"', '    "Language & Translation": "Dil ve Çeviri",\n' + appendStr);
   i18n = i18n.replace(targetMatch, updated);
} else {
   console.log("Could not find Language block to insert");
}
fs.writeFileSync('src/i18n.ts', i18n);

let calib = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');
calib = calib.replace(/alert\("Under GPRO rules[^"]+"\);/, 'alert(t("Under GPRO rules, you may only use one type of dry compound per race. Other stints will be synced automatically."));');
calib = calib.replace(/alert\("Incorrect number of laps entered\."\);/, 'alert(t("Incorrect number of laps entered."));');
calib = calib.replace(/alert\('Ayarlar başarıyla Profil\\'e kalibre edildi!'\);/, 'alert(t("Settings successfully calibrated to Profile!"));');
calib = calib.replace(/"🚨 Your tyre wear factor is very high![^"]+"/, 't("🚨 Your tyre wear factor is very high! You reached the puncture limits in some stints. Lower driver aggression.")');
calib = calib.replace(/"✨ Excellent tyre economy\. Wear is well below average\."/, 't("✨ Excellent tyre economy. Wear is well below average.")');
calib = calib.replace(/"📊 Your tyre wear is around the standard average\."/, 't("📊 Your tyre wear is around the standard average.")');
calib = calib.replace(/"⛽ Your base fuel consumption is very high\. Consider optimizing setups or engine updates\."/, 't("⛽ Your base fuel consumption is very high. Consider optimizing setups or engine updates.")');
calib = calib.replace(/"⚠️ Your stint laps sum up to more than the track laps! Check your inputs\.[^"]+"/, 't("⚠️ Your stint laps sum up to more than the track laps! Check your inputs.")');
calib = calib.replace(/`⚠️ You probably DNF'd or crashed, you mapped fewer laps than the track total\.[^`]+`/, 't("⚠️ You probably DNF\'d or crashed, you mapped fewer laps than the track total.") + " (" + totalLaps + ") "');
calib = calib.replace(/"💧 Despite heavy rain probability, you stubbornly stayed on dry tyres![^"]+"/, 't("💧 Despite heavy rain probability, you stubbornly stayed on dry tyres! The high wear reflects this loss of grip.")');
calib = calib.replace(/"🌤️ You played it too safe with Rain tyres in mostly dry conditions, causing heavy wear and time loss\."/, 't("🌤️ You played it too safe with Rain tyres in mostly dry conditions, causing heavy wear and time loss.")');
calib = calib.replace(/"🌦️ Your tyre selection in transition periods looks reasonable\."/, 't("🌦️ Your tyre selection in transition periods looks reasonable.")');
calib = calib.replace(/'Error!'/, "t('Error!')");
fs.writeFileSync('src/components/CalibrationView.tsx', calib);

let check = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');
check = check.replace(/"Error connecting to AI Assistant\."/, 't("Error connecting to AI Assistant.")');
check = check.replace(/"E\.g\. What should I do if it rains at lap 20\?"/, 't("E.g. What should I do if it rains at lap 20?")');
fs.writeFileSync('src/components/ChecklistView.tsx', check);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/> AI Assistant</, ">{t('AI Assistant')}<");
app = app.replace(/>Race Analysis & Pre-Race Checklist</, ">{t('Race Analysis & Pre-Race Checklist')}<");
app = app.replace(/>Calibration and test lap evaluator\.</, ">{t('Calibration and test lap evaluator.')}<");
app = app.replace(/>Open Assistant </, ">{t('Open Assistant')} <");
app = app.replace(/>Setup Assistant</, ">{t('Setup Assistant')}<");

app = app.replace(/  const \[settings, setLocalSettings\] = useState\(\{\n    theme: 'system',\n    language: 'en',\n    gproToken: '',/, "  const [settings, setLocalSettings] = useState({\n    theme: 'system',\n    language: 'en',\n    autoTranslate: false,\n    gproToken: '',");

const setLanguageLoc = "  // Set language synchronously before children render\n  setLanguage(settings.language || 'en');";
const setLanguageNew = `  // AutoTranslate logic
  useEffect(() => {
    if (settings.autoTranslate) {
       const browserLang = navigator.language || navigator.languages[0] || 'en';
       const target = browserLang.toLowerCase().startsWith('tr') ? 'tr' : 'en';
       if (settings.language !== target) {
         setLocalSettings(s => ({...s, language: target}));
       }
    }
  }, [settings.autoTranslate]);

  // Set language synchronously before children render
  setLanguage(settings.language || 'en');`;

if (!app.includes('// AutoTranslate logic')) {
   app = app.replace(setLanguageLoc, setLanguageNew);
}

const toggleTranslation = `                           <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition mt-4">
                              <div>
                                 <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">{t("Auto Translate")} <Tooltip content={t("Display in other languages automatically")} /></div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400">{t("Enable automatic local translation based on your browser language.")}</div>
                              </div>
                              <input 
                                 type="checkbox" 
                                 className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                                 checked={!!settings.autoTranslate}
                                 onChange={e => setLocalSettings({...settings, autoTranslate: e.target.checked})} 
                              />
                           </label>`;

app = app.replace(/<\/select>\n                           <\/div>/, "</select>\n                           </div>\n" + toggleTranslation);
app = app.replace(/onChange=\{e => setLocalSettings\(\{\.\.\.settings, language: e\.target\.value\}\)\}/g, "onChange={e => setLocalSettings({...settings, language: e.target.value, autoTranslate: false})}");

fs.writeFileSync('src/App.tsx', app);
console.log("Done");
