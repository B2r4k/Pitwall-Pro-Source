import fs from 'fs';

let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/Pilot and araç ayarlarını varsayılan \(sıfırlanmış\) değerlere döndürmek istediğinize emin misiniz\?/g, "Are you sure you want to reset driver and car settings to default?");
c = c.replace(/Resim taranıyor, lütfen bekleyin\. Net kırpılmış görseller daha iyi sonuç verir\./g, "Scanning image, please wait. Clearly cropped images give better results.");
c = c.replace(/Önemli veriler algılandı\. Onayınız bekleniyor\./g, "Important data detected. Awaiting your confirmation.");
c = c.replace(/Yalnızca belirlenmiş alanlar varsa setter'ı güncelle/g, "Only update if there are determined fields");
c = c.replace(/Seçimi sıfırla ki aynı fotoğrafı\/dosyayı tekrar seçtiğimizde onChange tetiklensin\./g, "Reset selection so onChange triggers again for same file");
c = c.replace(/buluta yedekleyerek farklı cihazlardan eşzamanlı kullanabilir veya kaybolmasını önleyebilirsiniz\./g, "");
c = c.replace(/zaman kaybıdır \(Örn: 20-24 sn arası\)\./g, "Time lost in pitlane without refuelling (usually 20-24s).");
c = c.replace(/Tespit Edilen Yağmur Olasılıkları/g, "Detected Rain Probabilities");
c = c.replace(/Bu öneriler, seçilen pistin karakteristik yapısına and hava sıcaklığına göre özel tahminlenir\./g, "These suggestions are specifically estimated based on the track characteristics and air temperature.");
c = c.replace(/verilerinden çekilerek uyarlanır\. Pilot becerileri süspansiyon esnekliğini etkileyecektir\./g, "data and adapts accordingly. Driver skills affect suspension travel.");
c = c.replace(/Yokohama \(Oldukça Durable\)/g, "Yokohama (Highly Durable)");
c = c.replace(/Hiçbir geçerli strateji bulunamadı\. Lastikler çok fazla ısınıyor veya aşınıyor olabilir\. \(Pist sekmesinden sıcaklık veya aşınma koşullarını yumuşatmayı deneyin\)/g, "No valid strategy found. Tyres might be overheating or wearing too fast. Try softening the temp/wear conditions.");
c = c.replace(/Sıcaklıklar optimum seviyede, agresif stratejiler nispeten güandnle uygulanabilir\./g, "Temperatures are optimal, aggressive strategies can be executed relatively safely.");

fs.writeFileSync('src/App.tsx', c);
