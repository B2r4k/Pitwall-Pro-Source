const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(
  `  const prevAppViewRef = useRef(appView);

  useEffect(() => {
    if (prevAppViewRef.current === "notifications" && appView !== "notifications") {
      const all = [...systemLogs, ...APP_NOTIFICATIONS];
      if (all.length > 0) {
        setLocalSettings((s) => ({
          ...s,
          lastViewedTimestamp: new Date(all[0].timestamp).getTime(),
        }));
      }
    }
    prevAppViewRef.current = appView;
  }, [appView, systemLogs, setLocalSettings]);

  const toggleNotifications = () => {
    if (appView === "notifications") {
      setAppView("calculator");
    } else {
      setAppView("notifications");
    }
  };

  const isNotificationNew = (note: any) => {
    return new Date(note.timestamp).getTime() > (settings.lastViewedTimestamp || 0);
  };

  const hasUnreadNotifications = useMemo(() => {
    const all = [...systemLogs, ...APP_NOTIFICATIONS];
    if (all.length === 0) return false;
    const topTimestamp = new Date(all[0].timestamp).getTime();
    return topTimestamp > (settings.lastViewedTimestamp || 0);
  }, [systemLogs, settings.lastViewedTimestamp]);`,
  `  const prevAppViewRef = useRef(appView);

  useEffect(() => {
    if (prevAppViewRef.current === "notifications" && appView !== "notifications") {
      const all = [...systemLogs, ...APP_NOTIFICATIONS];
      if (all.length > 0) {
        setLocalSettings((s) => ({
          ...s,
          lastViewedTimestamp: new Date(all[0].timestamp).getTime(),
          dismissedAlerts: [] // Eski (okunmus) bildirimleri temizleyip cloud'da yer aciyoruz
        }));
      }
    }
    prevAppViewRef.current = appView;
  }, [appView, systemLogs, setLocalSettings]);

  const toggleNotifications = () => {
    if (appView === "notifications") {
      setAppView("calculator");
    } else {
      setAppView("notifications");
    }
  };

  const isNotificationNew = (note: any) => {
    if ((settings.dismissedAlerts || []).includes(note.id)) return false;
    return new Date(note.timestamp).getTime() > (settings.lastViewedTimestamp || 0);
  };

  const hasUnreadNotifications = useMemo(() => {
    const all = [...systemLogs, ...APP_NOTIFICATIONS];
    return all.some(note => isNotificationNew(note));
  }, [systemLogs, settings.lastViewedTimestamp, settings.dismissedAlerts]);`
);

fs.writeFileSync('src/App.tsx', c);
console.log("App.tsx notification logic fixed");
