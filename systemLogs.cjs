const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const stateDeclaration = `const [isSyncing, setIsSyncing] = useState(false);
  const [systemLogs, setSystemLogs] = useState<{id: string, type: 'in-game' | 'patch-note', title: string, message: string, timestamp: string}[]>([]);

  useEffect(() => {
     const checkRaceTime = () => {
        const h = new Date().getHours();
        if (h >= 21 && h < 22) {
           setSystemLogs(prev => {
              if (prev.find(l => l.id === 'live-race-active')) return prev;
              return [{
                 id: 'live-race-active',
                 type: 'in-game',
                 title: 'Yarış Devam Ediyor!',
                 message: 'Şu anda yarış saatleri içerisindeyiz (21:00 - 22:00). Stratejilerinizi uygulamak için hazırsanız yarışa geçin!',
                 timestamp: new Date().toISOString()
              }, ...prev];
           });
        } else {
           setSystemLogs(prev => prev.filter(l => l.id !== 'live-race-active'));
        }
     };
     checkRaceTime();
     const interval = setInterval(checkRaceTime, 60000);
     return () => clearInterval(interval);
  }, []);

  const addSystemLog = (title: string, message: string, type: 'in-game'|'patch-note' = 'in-game') => {
      setSystemLogs(prev => [{
          id: 'log-' + Date.now(),
          type,
          title,
          message,
          timestamp: new Date().toISOString()
      }, ...prev]);
  };
`;

c = c.replace("const [isSyncing, setIsSyncing] = useState(false);", stateDeclaration);

c = c.replace(/setSyncStatus\(t\('Data Fetched \+ Applied'\)\);/, "setSyncStatus(t('Data Fetched + Applied'));\n        if(isAuto) addSystemLog('Otomatik API Çekimi Başarılı', 'Uygulama otomatik olarak GPRO verilerinizi başarıyla güncelledi.', 'in-game');");

c = c.replace(/console\.error\("Error fetching GPRO API:", err\);/, "console.error(\"Error fetching GPRO API:\", err);\n        addSystemLog('API Bağlantı Hatası', 'GPRO sunucularına bağlanırken veya veri çekerken bir sorun oluştu: ' + (err as Error).message, 'patch-note');");

c = c.replace(/APP_NOTIFICATIONS\.filter/g, "[...systemLogs, ...APP_NOTIFICATIONS].filter");
c = c.replace(/APP_NOTIFICATIONS\.length/g, "[...systemLogs, ...APP_NOTIFICATIONS].length");
c = c.replace(/APP_NOTIFICATIONS\[0\]/g, "[...systemLogs, ...APP_NOTIFICATIONS][0]");

fs.writeFileSync('src/App.tsx', c);
