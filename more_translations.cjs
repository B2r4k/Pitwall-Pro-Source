const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const reps = {
  '>Akıllı Setup Asistanı<': '>{t("Smart Setup Assistant")}<',
  '>Dynamic recommendations based on active track and weather<': '>{t("Dynamic recommendations based on active track and weather")}<',
  '>Kanat (FW/RW)<': '>{t("Wings (FW/RW)")}<',
  '>Sert<': '>{t("Hard")}<',
  '>Orta<': '>{t("Medium")}<',
  '>Increase downforce in high temperature<': '>{t("Increase downforce in high temperature")}<',
  '>Acceleration focus': '>{t("Acceleration focus")}',
  '>Motor (Engine)<': '>{t("Engine")}<',
  '>Suspension<': '>{t("Suspension")}<',
  '>Corner balance focus<': '>{t("Corner balance focus")}<',
  '<strong>Setup Note:</strong>': '<strong>{t("Setup Note:")}</strong>',
  '>Calculations automatically adapt using the temperature ': '>{t("Calculations automatically adapt using the temperature")} ',
  ' and ': ' {t("and")} ',
  '> data and adapts accordingly. Driver skills affect suspension travel.<': '>{t("data and adapts accordingly. Driver skills affect suspension travel.")}<',
  'Pipirelli (Fast / Very High Wear)': 'Pipirelli ({t("Fast / Very High Wear")})',
  'Avonn (Extreme Wear)': 'Avonn ({t("Extreme Wear")})',
  'Dengeli': '{t("Balanced")}',
  '>Dunnolop (Durable)<': '>Dunnolop ({t("Durable")})<',
  '>Yokohama (Highly Durable)<': '>Yokohama ({t("Highly Durable")})<',
  '>Michelin (Aşırı Durable)<': '>Michelin ({t("Extremely Durable")})<',
  '>Bridgestone (Good)<': '>Bridgestone ({t("Good")})<',
  '>Hancock (Bad)<': '>Hancock ({t("Bad")})<',
  '>Focus ': '>{t("Focus")} ',
  '>Experience ': '>{t("Experience")} ',
  '>Calculated penalty per liter:': '>{t("Calculated penalty per liter:")}',
  '>Refuel Rate (L/s)<': '>{t("Refuel Rate (L/s)")}<',
  '>Aktif Pist<': '>{t("Active Track")}<',
  '>Fuel per Lap<': '>{t("Fuel per Lap")}<',
  '>Pit Stop Parametresi<': '>{t("Pit Stop Parameter")}<',
  '>Baz:': '>{t("Base:")}',
  'sn<': '{t("sec")}<',
  '>Selected Strategy:': '>{t("Selected Strategy:")}',
  '>Relative Time Cost:': '>{t("Relative Time Cost:")}',
  '>Fastest (Recommended)<': '>{t("Fastest (Recommended)")}<',
  '>Inspecting<': '>{t("Inspecting")}<',
  '>Overwear Risk<': '>{t("Overwear Risk")}<',
  '>Stint ': '>{t("Stint")} ',
  '>Mesafe:': '>{t("Distance:")}',
  '>Wear:': '>{t("Wear:")}',
  '>Fuel:': '>{t("Fuel:")}',
  '>Strateji Systeminin Yorumu<': '>{t("Strategy Engine Recommendation")}<',
  '>Yapay Fikir<': '>{t("AI Insight")}<',
  '>Recommended<': '>{t("Recommended")}<',
  '>Onayla & Systeme İşle<': '>{t("Confirm & Process")}<',
  '>İptal<': '>{t("Cancel")}<',
  '>Detected Rain Probabilities (%)<': '>{t("Detected Rain Probabilities (%)")}<'
}

for (const [key, val] of Object.entries(reps)) {
  app = app.split(key).join(val);
}

fs.writeFileSync('src/App.tsx', app);
