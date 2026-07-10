import fs from 'fs';
let content = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');

const replacements = {
  "Analitik Eğitim Seti": "Analytical Calibration Suite",
  "Geçmiş verilerinizi girerek": "Enter past race data to precisely calibrate your car and driver stats.",
  "Geçmiş Pist": "Past Track",
  "Yağmur Verisi\\?": "Rain Conditions?",
  "Aktif": "Active",
  "Havalar Temizdi": "Dry Race",
  "Tahmini Yağış Değerleri \\(%\\)": "Estimated Rain Probabilities (%)",
  "O yarışa ait olan hava durumu olasılıklarını \\(0-30m, 30-60 vs\\)": "Approximate rain chances during that session.",
  "Pit Stratejisi & Stintler": "Pit Strategy & Stints",
  "Yarış boyunca attığınız her stint'i \\(ör: başlayıp 1. pite kadar olan süreç\\)": "Add your stints. At least 1 dry compound is mandatory.",
  "Hamur": "Compound",
  "Tur \\(Stint\\)": "Laps (Stint)",
  "Erime \\(%\\)": "Wear (%)",
  "Yakıt \\(L\\)": "Fuel (L)",
  "Son stintin harcanan yakıtı önceki stintlerin ortalaması baz alınarak otomatik tahmin edilir.": "Last stint fuel is auto-estimated based on previous average.",
  "Tahmini Ortalama": "Estimated Average",
  "Yeni Stint \\(Pit\\)": "New Stint (Pit)",
  "Genel Yarış Kondisyonları": "Overall Race Conditions",
  "Ort. Sıc. \\(°C\\)": "Avg Temp (°C)",
  "Tüm yarış ortalaması hava veya pist.": "Average race or track temperature.",
  "Risk B.": "Risk Lvl",
  "Yarış Verisini Değerlendir": "Evaluate Race Data",
  "Çıkarılan Temel Değerler": "Extracted Base Values",
  "Yakıt Harcaması": "Fuel Burn",
  "Tur başına motor tüketiminiz. Kalibrasyon sonrasında tüm yarış hesaplarınızı buna göre güncelleyecek.": "Fuel burn per lap. Used to update global settings after calibration.",
  "L/Tur": "L/Lap",
  "Aşınma Faktörü": "Wear Factor",
  "Aracınız ve pilotunuzun lastiği eritme hızı skalası. 1.0 standarttır.": "Your car and driver's standard tyre wear rate scale. 1.0 is default.",
  "YZ Mühendis Raporu": "AI Engineer Insight",
  "Kabul Et ve Profil'e Uyarla": "Accept and Apply to Profile",
  "Değerler hesap panelinize senkronize edilecek.": "Values will be synced to your account.",
  "Pistte atılan tur sayısı hatalı.": "Incorrect number of laps entered.",
  "Hata!": "Error!",
  "GPRO kuralları gereği yarış esnasında yağmur lastiği hariç sadece 1 tip kuru zemin hamuru kullanabilirsiniz. Diğer stintleriniz de ona göre değişecek.": "Under GPRO rules, you may only use one type of dry compound per race. Other stints will be synced automatically.",
  "Lastik aşınma çarpanınız yarış genelinde çok yüksek!": "Your tyre wear factor is very high! You reached the puncture limits in some stints. Lower driver aggression.",
  "Harika bir lastik ekonomisi. Ortalamanın çok altında aşınma var.": "Excellent tyre economy. Wear is well below average.",
  "Lastik aşınma değerleriniz yarış geneli ortalamasında standart seviyelerde.": "Your tyre wear is around the standard average.",
  "Temel yakıt tüketiminiz epey yüksek seviyede. Gelecekte aerodinamik veya motor güncellemelerinizi buna göre optimize edin.": "Your base fuel consumption is very high. Consider optimizing setups or engine updates.",
  "Girdiğiniz stintlerin toplam tur sayısı pistin tur sayısından fazla!": "Your stint laps sum up to more than the track laps! Check your inputs.",
  "Sonda kaza veya DNF yaşadınız sanırım, pistin toplam turları tamamlanmamış": "You probably DNF'd or crashed, you mapped fewer laps than the track total.",
  "Yağış oranı ciddi seyrettiği halde tüm yarış kuru zemin lastikleriyle inatlaşmışsınız!": "Despite heavy rain probability, you stubbornly stayed on dry tyres! The high wear reflects this loss of grip.",
  "Hava genel olarak açıkken fazla tedbirli olup ıslak zemin lastiği takmış görünüyorsunuz. Bu da tur başı yüksek saniye kaybına \\(erimeye\\) yol açar.": "You played it too safe with Rain tyres in mostly dry conditions, causing heavy wear and time loss.",
  "Yağış geçişlerine karşı lastik değişim reaksiyonlarınız makul görünüyor.": "Your tyre selection in transition periods looks reasonable.",
  "Ayarlar başarıyla Profil'e kalibre edildi!": "Calibration successfully applied to your Profile!"
};

for (const [tr, en] of Object.entries(replacements)) {
  content = content.replace(new RegExp(tr, 'g'), en);
}
fs.writeFileSync('src/components/CalibrationView.tsx', content);
console.log('CalibrationView translated');
