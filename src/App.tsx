
export const F1_CALENDAR_S113 = [
  { id: 'melbourne', name: 'Melbourne', date: '2026-05-26T18:00:00Z' },
  { id: 'catalunya', name: 'Barcelona', date: '2026-05-29T18:00:00Z' },
  { id: 'montreal', name: 'Montreal', date: '2026-06-02T18:00:00Z' },
  { id: 'silverstone', name: 'Silverstone', date: '2026-06-05T18:00:00Z' },
  { id: 'spa', name: 'Spa', date: '2026-06-09T18:00:00Z' },
  { id: 'monza', name: 'Monza', date: '2026-06-12T18:00:00Z' },
  { id: 'interlagos', name: 'Interlagos', date: '2026-06-16T18:00:00Z' },
  { id: 'bahrain', name: 'Sakhir', date: '2026-06-19T18:00:00Z' },
  { id: 'sepang', name: 'Sepang', date: '2026-06-23T18:00:00Z' },
  { id: 'monaco', name: 'Monaco', date: '2026-06-26T18:00:00Z' },
  { id: 'shanghai', name: 'Shanghai', date: '2026-06-30T18:00:00Z' },
  { id: 'zandvoort', name: 'Zandvoort', date: '2026-07-03T18:00:00Z' },
  { id: 'suzuka', name: 'Suzuka', date: '2026-07-07T18:00:00Z' },
  { id: 'austin', name: 'Austin', date: '2026-07-10T18:00:00Z' },
  { id: 'mexico_city', name: 'Mexico City', date: '2026-07-14T18:00:00Z' },
  { id: 'brasilia', name: 'Brasilia', date: '2026-07-17T18:00:00Z' },
  { id: 'baku', name: 'Baku City', date: '2026-07-21T18:00:00Z' }
];

import { t, setLanguage } from "./i18n";
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './firebase';
import Tesseract from 'tesseract.js';
import { TRACK_DATABASE, SEVERITY_MULTIPLIERS, COMPOUND_FULL_NAMES } from './data';
import { Track, Weather, PlayerStats } from './types';
import { analyzeStrategies, CalcParams, calculateFuelPerLap, simulateStint } from './utils/calculator';
import CalibrationView from './components/CalibrationView';
import TrackAnalysisView from './components/TrackAnalysisView';
import Tooltip from './components/Tooltip';
import EconomyView from './components/EconomyView';
import TelemetryContributeView from './components/TelemetryContributeView';
import TeamDataPool from './components/TeamDataPool';
import QuickNotes from './components/QuickNotes';
import AdminPanel from './components/AdminPanel';
import SimulationEngine from './components/SimulationEngine';
import RivalAnalysisTab from './components/RivalAnalysisTab';
import NumberInput from './components/NumberInput';
import { DataIntegrationsPanel } from './components/DataIntegrationsPanel';
import { LoadingScreen } from './components/LoadingScreen';
import { APP_NOTIFICATIONS } from './data/notifications';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

import { 
  LayoutDashboard,
  Settings, 
  Map as MapIcon, 
  CloudRain, 
  Thermometer, 
  User, 
  BarChart3, 
  Info,
  Activity,
  Fuel,
  Siren,
  Clock,
  Wrench,
  Search,
  Menu,
  Users,
  Crosshair,
  ChevronRight,
  MonitorSmartphone,
  CloudCog,
  RotateCcw,
  CheckCircle, Save,
  MessageSquare,
  Star,
  Goal,
  Map,
  Home,
  Circle,
  Bell,
  Send,
  TrendingUp,
  Download,
  Copy,
  AlertTriangle
} from 'lucide-react';


const checkIsBlindZone = () => {
    const d = new Date();
    const utcHour = d.getUTCHours();
    const utcDay = d.getUTCDay();
    return (utcDay === 2 || utcDay === 5) && utcHour >= 18 && utcHour < 20;
};

const PrepDot = ({ fieldKey, active, settings }: { fieldKey: string, active: boolean, settings: any }) => {
   if (!active) return null;
   const isBlindZone = checkIsBlindZone();
   if (isBlindZone) {
      return (
          <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3 z-20 pointer-events-none" title="Race Time (Blind Zone)">
             <span className="relative inline-flex rounded-full h-3 w-3 border border-white dark:border-slate-800 shadow-sm bg-slate-400/80 dark:bg-slate-500/80"></span>
          </div>
      );
   }
   const updatedTime = settings.prepFieldsLastUpdated?.[fieldKey];
   const isReady = !!updatedTime;
   return (
       <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3 z-20 pointer-events-none" title={isReady ? "Prepared" : "Needs Preparation"}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isReady ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 border border-white dark:border-slate-800 shadow-sm ${isReady ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
       </div>
   );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemLogs, setSystemLogs] = useState<{id: string, type: 'in-game' | 'patch-note', title: string, message: string, timestamp: string}[]>([]);

  useEffect(() => {
     const checkRaceTime = () => {
        const d = new Date();
        const utcHour = d.getUTCHours();
        const utcDay = d.getUTCDay();
        if ((utcDay === 2 || utcDay === 5) && utcHour >= 18 && utcHour < 20) {
           setSystemLogs(prev => {
              if (prev.find(l => l.id === 'live-race-active')) return prev;
              return [{
                 id: 'live-race-active',
                 type: 'in-game',
                 title: 'Yarış Devam Ediyor!',
                 message: 'Şu anda yarış saatleri içerisindeyiz (21:00 - 23:00). Stratejilerinizi uygulamak için hazırsanız yarışa geçin!',
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

  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isDark, setIsDark] = useState(false);
  const [isAppInitializing, setIsAppInitializing] = useState(true);

  useEffect(() => {
     const timer = setTimeout(() => setIsAppInitializing(false), 2500);
     return () => clearTimeout(timer);
  }, []);
    
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);

  const handleSendFeedback = async () => {
    if(!feedbackText.trim()) return;
    setFeedbackSending(true);
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await addDoc(collection(db, 'feedback'), { 
        text: feedbackText, 
        rating: feedbackRating,
        timestamp: new Date(),
        email: currentUser?.email || 'anonymous'
      });
      setFeedbackSent(true);
      setFeedbackText('');
      setFeedbackRating(5);
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch(err: any) {
      console.error(err);
      alert('Error submitting feedback: ' + (err.message || 'Unknown network error.'));
    } finally {
      setFeedbackSending(false);
    }
  };

  useEffect(() => {
    const handleOrientation = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      // Do not use resize + innerHeight as soft keyboards shrink the height
      if (isLandscape) {
         document.documentElement.setAttribute('data-landscape', 'true');
      } else {
         document.documentElement.removeAttribute('data-landscape');
      }
    };
    handleOrientation();
    window.addEventListener('orientationchange', handleOrientation);
    // Optional: matchMedia listener is safer than window resize
    const mql = window.matchMedia("(orientation: landscape)");
    const mqlListener = (e: MediaQueryListEvent) => {
       if (e.matches) document.documentElement.setAttribute('data-landscape', 'true');
       else document.documentElement.removeAttribute('data-landscape');
    };
    if (mql.addEventListener) mql.addEventListener('change', mqlListener);
    
    return () => {
       window.removeEventListener('orientationchange', handleOrientation);
       if (mql.removeEventListener) mql.removeEventListener('change', mqlListener);
    };
  }, []);

  const markFieldUpdated = (fieldKey: string) => {
    setLocalSettings(prev => ({
        ...prev, 
        prepFieldsLastUpdated: { ...(prev.prepFieldsLastUpdated || {}), [fieldKey]: Date.now() }
    }));
  };

  const [settings, setLocalSettings] = useState({
    theme: 'system',
    language: 'en',
    autoTranslate: false,
    gproToken: '',
    notifications: false,
    smartSync: true,
    lastViewedNotification: '',
    onboardingSeen: false,
    autoApiSync: false,
    lastApiSyncTime: 0,
    apiModules: { driver: true, practice: true, office: true, carUpdate: true, staff: true, setup: true, trackProfile: true, testing: true },
    apiSyncOptions: { driver: true, car: true, track: true, weather: true, risks: true, ignoreFiltersAuto: true },
    prepFieldsLastUpdated: {},
    prepCycleId: '',
    isPrepOverlayActive: false
  });

  const [hiddenStints, setHiddenStints] = useState<number[]>([]);



  useEffect(() => {
    const root = window.document.documentElement;
    const updateTheme = () => {
       root.classList.remove('light', 'dark');
       if (settings.theme === 'system') {
         const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
         root.classList.add(systemTheme);
         setIsDark(systemTheme === 'dark');
       } else {
         root.classList.add(settings.theme);
         setIsDark(settings.theme === 'dark');
       }
    };
    
    updateTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [settings.theme]);

  // AutoTranslate logic
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
  setLanguage(settings.language || 'en');

  const [activeTab, setActiveTab] = useState<'home' | 'strategy' | 'track_setup' | 'driver_profile' | 'assistant' | 'economy' | 'telemetry' | 'rival_analysis'>('home');
  const [appView, setAppView] = useState<'calculator' | 'menu' | 'settings' | 'account' | 'notifications' | 'admin' | 'simulation' | 'integrations'>('calculator');

  const toggleMenu = () => {
    if (appView === 'notifications') {
      setAppView('menu');
    } else if (appView !== 'calculator') {
      setAppView('calculator');
    } else {
      setAppView('menu');
    }
  };

  const toggleNotifications = () => {
    if (appView === 'notifications') {
      setAppView('calculator');
    } else {
      setAppView('notifications');
      // Mark all as read
      if ([...systemLogs, ...APP_NOTIFICATIONS].length > 0) {
         setLocalSettings(s => ({...s, lastViewedNotification: [...systemLogs, ...APP_NOTIFICATIONS][0].id}));
      }
    }
  };

  const hasUnreadNotifications = [...systemLogs, ...APP_NOTIFICATIONS].length > 0 && settings.lastViewedNotification !== [...systemLogs, ...APP_NOTIFICATIONS][0].id;

  const [showInAppNotification, setShowInAppNotification] = useState(false);
  
  useEffect(() => {
    if (settings.notifications && hasUnreadNotifications) {
      const timer = setTimeout(() => {
        setShowInAppNotification(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowInAppNotification(false);
    }
  }, [hasUnreadNotifications, settings.notifications]);

  // Timer States
  const [nextRaceName, setNextRaceName] = useState<string>('');
  const [nextRaceTime, setNextRaceTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (!nextRaceTime) return;
    
    const calculateTimeLeft = () => {
       const now = Date.now();
       const diff = nextRaceTime - now;
       if (diff <= 0) {
          setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
          if (diff <= -2.5 * 3600 * 1000) {
              guessCurrentTrack(true);
          }
          return;
       }
       setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
       });
    };
    
    calculateTimeLeft(); // Run immediately
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [nextRaceTime]);

  // Inputs State
  const [selectedTrackId, setSelectedTrackId] = useState<string>('melbourne');
  const [customTrack, setCustomTrack] = useState<Track>(TRACK_DATABASE.find(t => t.id === 'custom')!);

  
  const [weather, setWeather] = useState<Weather>({
    tempBase: 20,
    tempMax: 25,
    rainProps: {
      q1: 0,
      q2_r1: 0,
      r2: 0,
      r3: 0,
      r4: 0
    }
  });

  const DEFAULT_PLAYER: PlayerStats = {
    baseFuelPerLap: 3.0,
    baseWearMultiplier: 1.0,
    riskAggression: 20,
    driverFocus: 100,
    driverStamina: 100,
    driverExperience: 50,
    tyreSupplier: 'Pipirelli',
    league: 'Rookie',
    startPosition: 1,
    totalRacers: 40,
    risks: { clear: 40, defend: 20, overtake: 30, malfunction: 10 },
    pha: { power: 20, handling: 18, acceleration: 17 },
    carParts: {
      chassis: 1, engine: 1, frontWing: 1, rearWing: 1, 
      underbody: 1, sidepods: 1, cooling: 1, gearbox: 1, 
      brakes: 1, suspension: 1, electronics: 1
    }
  };

  const [player, setPlayer] = useState<PlayerStats>(DEFAULT_PLAYER);

  const [savedProfiles, setSavedProfiles] = useState<PlayerStats[]>([]);
  const [activeProfileIdx, setActiveProfileIdx] = useState<number>(0);


  
  const switchProfile = (idx: number) => {
    const newProfiles = [...savedProfiles];
    if (savedProfiles.length === 0) newProfiles.push(player);
    else newProfiles[activeProfileIdx] = player;
    
    setSavedProfiles(newProfiles);
    setActiveProfileIdx(idx);
    if (newProfiles[idx]) {
      setPlayer(newProfiles[idx]);
    } else {
      setPlayer({ ...player, name: 'Driver ' + (idx + 1) });
    }
  };
  
  const deleteProfile = (idx: number) => {
    if (savedProfiles.length <= 1) return;
    const newProfiles = savedProfiles.filter((_, i) => i !== idx);
    setSavedProfiles(newProfiles);
    setActiveProfileIdx(0);
    setPlayer(newProfiles[0]);
  };

  // Updated to researched GPRO standard starting point
  const [constants, setConstants] = useState({
    driverWeight: 80, // seconds penalty per lap per liter
    pitRefuelRate: 1.5 // liters per second
  });

  // Prep fields tracker
  const prevTrackRef = useRef(selectedTrackId);
  const prevWeatherRef = useRef(weather);
  const prevPlayerRef = useRef(player);
  const prevConstantsRef = useRef(constants);

  useEffect(() => {
      const now = Date.now();
      let updates: Record<string, number> = {};

      if (selectedTrackId !== prevTrackRef.current) updates.track = now;
      if (weather.tempBase !== prevWeatherRef.current.tempBase || weather.tempMax !== prevWeatherRef.current.tempMax || weather.rainProps !== prevWeatherRef.current.rainProps) updates.weather = now;
      
      const p = player;
      const prevP = prevPlayerRef.current;
      if (p.driverFocus !== prevP.driverFocus) updates.driverFocus = now;
      if (p.driverStamina !== prevP.driverStamina) updates.driverStamina = now;
      if (p.driverExperience !== prevP.driverExperience) updates.driverExperience = now;
      if (p.riskAggression !== prevP.riskAggression) updates.riskAggression = now;
      if (p.energy !== prevP.energy) updates.driverEnergy = now;
      if (p.baseWearMultiplier !== prevP.baseWearMultiplier) updates.driverWearMultiplier = now;
      if (p.baseFuelPerLap !== prevP.baseFuelPerLap) updates.baseFuelPerLap = now;
      
      const c = constants;
      const prevC = prevConstantsRef.current;
      if (c.driverWeight !== prevC.driverWeight) updates.driverWeight = now;
      if (c.pitRefuelRate !== prevC.pitRefuelRate) updates.pitRefuelRate = now;
      
      if (p.startPosition !== prevP.startPosition) updates.startPosition = now;
      if (p.totalRacers !== prevP.totalRacers) updates.totalRacers = now;
      if (p.league !== prevP.league) updates.league = now;
      if (p.pha?.power !== prevP.pha?.power || p.pha?.handling !== prevP.pha?.handling || p.pha?.acceleration !== prevP.pha?.acceleration) updates.carPHA = now;
      if (p.carParts !== prevP.carParts) updates.carParts = now;
      if (p.carWear !== prevP.carWear) updates.carWear = now;
      if (p.risks !== prevP.risks) updates.risks = now;
      
      if (Object.keys(updates).length > 0) {
         setLocalSettings(s => ({
            ...s,
            prepFieldsLastUpdated: { ...(s.prepFieldsLastUpdated || {}), ...updates }
         }));
      }

      prevTrackRef.current = selectedTrackId;
      prevWeatherRef.current = weather;
      prevPlayerRef.current = player;
      prevConstantsRef.current = constants;
  }, [selectedTrackId, weather, player, constants]);

  const loadFromCloudData = async (uidToLoad: string, shouldSetSyncing = true) => {
    try {
      if (shouldSetSyncing) setIsSyncing(true);
      setSyncStatus(t('Loading...'));
      
      let data: any = null;
      
      const activeUid = uidToLoad !== 'local_uid' ? uidToLoad : (currentUser?.uid || null);
      console.log("Firebase getDoc - activeUid:", activeUid, "currentUser.uid:", currentUser?.uid);
      if (activeUid) {
         try {
            const d = await getDoc(doc(db, 'users', activeUid));
            if (d.exists() && d.data().data) {
               data = d.data().data;
            }
         } catch (e) {
            console.error("Firebase load err", e);
         }
      }

      const stored = localStorage.getItem('gpro_calculator_save');
      if (stored) {
         const localData = JSON.parse(stored);
         if (!data || (localData.updatedAt && data.updatedAt && new Date(localData.updatedAt) > new Date(data.updatedAt))) {
            data = localData;
         }
      }

      if (data) {
        if (data.savedProfiles && data.savedProfiles.length > 0) {
           setSavedProfiles(data.savedProfiles);
           setPlayer(data.savedProfiles[data.activeProfileIdx || 0] || data.savedProfiles[0]);
           setActiveProfileIdx(data.activeProfileIdx || 0);
        }
        if (data.settings) {
           setLocalSettings(prev => ({
             ...prev,
             ...data.settings,
             apiSyncOptions: { ...prev.apiSyncOptions, ...(data.settings.apiSyncOptions || {}) },
             onboardingSeen: data.settings.onboardingSeen ?? prev.onboardingSeen
           }));
        }
        if (data.customTrack) setCustomTrack(data.customTrack);
        if (data.weather) setWeather(data.weather);
        if (data.constants) setConstants(data.constants);
                if (data.selectedTrackId) {
           setSelectedTrackId(data.selectedTrackId);
        }
        setSyncStatus(t('Loaded successfully!'));
        setTimeout(() => setSyncStatus(''), 3000);
      } else {
        setSyncStatus(t('No saved data found.'));
        setTimeout(() => setSyncStatus(''), 3000);
      }
    } catch (e) {
      console.error(e);
      setSyncStatus(t('Load error!'));
      setTimeout(() => setSyncStatus(''), 3000);
    } finally {
      if (shouldSetSyncing) setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Also load on boot!
    loadFromCloudData('local_uid', false);
    
    // Auth is kept if they still want to log in, but we don't depend on Firestore!
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
         loadFromCloudData(user.uid, false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFromCloud = () => {
    loadFromCloudData('local_uid', true);
  };

  // Auto-save logic (Local Storage + Firebase)
  useEffect(() => {
    if (settings.smartSync) {
      const timeout = setTimeout(async () => {
        try {
          const payload = {
             savedProfiles: (() => { const p = [...savedProfiles]; p[activeProfileIdx] = player; return p.length > 0 ? p : [player]; })(),
             activeProfileIdx: activeProfileIdx,
             settings: settings,
             customTrack: customTrack,
             weather: weather,
             constants: constants,
             selectedTrackId: selectedTrackId,
                          updatedAt: new Date().toISOString()
          };
          localStorage.setItem('gpro_calculator_save', JSON.stringify(payload));
          
          if (currentUser && currentUser.uid) {
            console.log("Firebase setDoc - currentUser.uid:", currentUser.uid);
            const { serverTimestamp } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', currentUser.uid), { 
                userId: currentUser.uid,
                data: payload,
                updatedAt: serverTimestamp()
            }, { merge: true }).catch(err => {
               console.error("Firebase setDoc error:", err);
            });
          }
          
          setSyncStatus(t('Saved successfully!'));
          setTimeout(() => setSyncStatus(''), 2000);
        } catch (e) {
           console.error(e);
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [player, settings, customTrack, weather, constants, savedProfiles, activeProfileIdx, selectedTrackId, currentUser]);

  const _unused_saveToCloud = () => {};

const saveDriverToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus(t('Saving driver...'));
    try {
      const payload = {
         savedProfiles: (() => { const p = [...savedProfiles]; p[activeProfileIdx] = player; return p.length > 0 ? p : [player]; })(),
         activeProfileIdx: activeProfileIdx,
         settings: settings,
         customTrack: customTrack,
         weather: weather,
         constants: constants,
         selectedTrackId: selectedTrackId,
         updatedAt: new Date().toISOString(),
               };
      localStorage.setItem('gpro_calculator_save', JSON.stringify(payload));
      
      if (currentUser && currentUser.uid) {
         const { serverTimestamp } = await import('firebase/firestore');
         await setDoc(doc(db, 'users', currentUser.uid), { 
            userId: currentUser.uid,
            data: payload,
            updatedAt: serverTimestamp()
         }, { merge: true }).catch(err => {
            console.error("Firebase manual setDoc error:", err);
         });
      }
      setSyncStatus(t('Saved successfully!'));
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setSyncStatus(t('Error'));
      setTimeout(() => setSyncStatus(''), 2000);
    }
    setIsSyncing(false);
  };

  const loadDriverFromCloud = async () => {
    setIsSyncing(true);
    await loadFromCloudData('local_uid', true);
    
    // Attempt to load the explicitly decoupled raw API fetch cache
    if (currentUser && currentUser.uid) {
       try {
          const { getDoc, doc } = await import('firebase/firestore');
          const statDoc = await getDoc(doc(db, 'driverStats', currentUser.uid));
          if (statDoc.exists()) {
             const sd = statDoc.data();
             setPlayer(p => {
                 const newP = { ...p };
                 if (sd.energy !== undefined) newP.energy = sd.energy;
                 if (sd.focus !== undefined) newP.focus = sd.focus;
                 if (sd.stamina !== undefined) newP.stamina = sd.stamina;
                 if (sd.experience !== undefined) newP.experience = sd.experience;
                 if (sd.weight !== undefined) newP.weight = sd.weight;
                 return newP;
             });
             console.log("Applied raw cached Driver Stats from Cloud.");
          }
       } catch(e) {
          console.error("Failed to fetch raw driver stats cache:", e);
       }
    }
    setIsSyncing(false);
  };

  
  const resetPlayerSettings = () => {
     if(confirm(t("Are you sure you want to reset driver and car settings to default?"))) {
         setPlayer(DEFAULT_PLAYER);
     }
  };

  const exportProfileToClipboard = () => {
    try {
      const data = btoa(JSON.stringify(player));
      navigator.clipboard.writeText(`GPRO-PROFILE:${data}`);
      setSyncStatus(t('Copied ID!'));
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (err) {
      alert("Error exporting profile");
    }
  };

  const exportProfileToFile = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(player, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `gpro-profile-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setSyncStatus(t('Exported!'));
      setTimeout(() => setSyncStatus(''), 3000);
    } catch(err) {
       console.error("Export file err", err);
    }
  };

  const importProfileFromFile = () => {
    if (fileInputRef.current) {
        fileInputRef.current.dataset.mode = 'json';
        fileInputRef.current.accept = ".json";
        fileInputRef.current.click();
    }
  };

  const importProfileFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('GPRO-PROFILE:')) {
         const data = JSON.parse(atob(text.replace('GPRO-PROFILE:', '')));
         setPlayer(data);
         setSyncStatus(t('Loaded successfully!'));
         setTimeout(() => setSyncStatus(''), 3000);
      } else {
         const manual = prompt(t("Paste GPRO-PROFILE code here:"));
         if (manual && manual.startsWith('GPRO-PROFILE:')) {
             const data = JSON.parse(atob(manual.replace('GPRO-PROFILE:', '')));
             setPlayer(data);
             setSyncStatus(t('Loaded successfully!'));
             setTimeout(() => setSyncStatus(''), 3000);
         } else if (manual) {
             alert(t("Invalid profile code."));
         }
      }
    } catch (err) {
      const manual = prompt(t("Could not read clipboard automatically. Paste GPRO-PROFILE code here:"));
      if (manual && manual.startsWith('GPRO-PROFILE:')) {
         const data = JSON.parse(atob(manual.replace('GPRO-PROFILE:', '')));
         setPlayer(data);
         setSyncStatus(t('Loaded successfully!'));
         setTimeout(() => setSyncStatus(''), 3000);
      } else if (manual) {
         alert(t("Invalid profile code."));
      }
    }
  };

  const [apiPreview, setApiPreview] = useState<any>(null);

  const applyApiData = () => {
     if (!apiPreview) return;
     const scrapedData = apiPreview;
     
     setPlayer(p => {
         const newP = { ...p };
         let changed = false;
         const opt = settings.apiSyncOptions || { driver: true, car: true, race: true };
         
         if (opt.driver && scrapedData) {
            if (scrapedData.energy !== undefined && newP.energy !== scrapedData.energy) { newP.energy = scrapedData.energy; changed = true; }
            if (scrapedData.weight !== undefined && newP.weight !== scrapedData.weight) { newP.weight = scrapedData.weight; changed = true; }
            if (scrapedData.focus !== undefined && newP.focus !== scrapedData.focus) { newP.focus = scrapedData.focus; changed = true; }
            if (scrapedData.stamina !== undefined && newP.stamina !== scrapedData.stamina) { newP.stamina = scrapedData.stamina; changed = true; }
            if (scrapedData.experience !== undefined && newP.experience !== scrapedData.experience) { newP.experience = scrapedData.experience; changed = true; }
         }
                  if (scrapedData.testingStints) {
             newP.testingData = scrapedData.testingStints;
             changed = true;
         }
         if (scrapedData.practiceLaps) {
             newP.practiceData = scrapedData.practiceLaps;
             changed = true;
         }
         return changed ? newP : p;
     });

     setApiPreview(null);
     setSyncStatus(t('Veriler Güncellendi!'));
     setTimeout(() => setSyncStatus(''), 3000);
     if (appView !== 'calculator') setAppView('calculator');
  };

  const fetchGproApi = async (isAuto = false) => {
    if (!settings.gproToken) {
       if (!isAuto) alert(t("Lütfen Settings kısmından GPRO API Token (JWT) bilginizi girin."));
       return;
    }
    if (isSyncing) return;
    setIsSyncing(true);
    if (!isAuto) setSyncStatus(t('GPRO Resmi API ile Bağlanıyor...'));
    
    try {
      const headers = {
         'Authorization': `Bearer ${settings.gproToken}`,
         'Accept': 'application/json'
      };

      const allEndpoints = [
        { url: '/backend/api/v2/DriProfile', key: 'driver' },
        { url: '/backend/api/v2/Practice', key: 'practice' },
        { url: '/backend/api/v2/office', key: 'office' },
        { url: '/backend/api/v2/UpdateCar', key: 'carUpdate' },
        { url: '/backend/api/v2/StaffAndFacilities', key: 'staff' },
        { url: '/backend/api/v2/RaceSetup', key: 'setup' },
        { url: '/backend/api/v2/TrackProfile', key: 'trackProfile' },
        { url: '/backend/api/v2/Testing', key: 'testing' }
      ];
      // Filter endpoints based on settings.apiModules
      const endpoints = allEndpoints.filter(ep => {
         if (!settings.apiModules) return true; // default to all if undefined
         return (settings.apiModules as any)[ep.key] !== false;
      });
      if (endpoints.length === 0) {
          setIsSyncing(false);
          if (!isAuto) { setSyncStatus("No modules selected to fetch."); setTimeout(() => setSyncStatus(""), 3000); }
          return;
      }
      const responses = await Promise.all(endpoints.map(ep => fetch('/api/gpro?endpoint=' + encodeURIComponent(ep.url), { method: 'GET', headers })));
      
      let scrapedData: any = {};
      let apiData: any = {}; // structured by endpoint
      for (let i = 0; i < responses.length; i++) {
          const res = responses[i];
          if (res.ok) {
             const data = await res.json();
             apiData[endpoints[i].key] = data;
             // Still merge for backwards compatibility where possible, but carefully.
             // Avoid merging StaffAndFacilities directly into flat scrapedData to prevent overwriting driver stats.
             if (endpoints[i].key !== 'staff') {
                scrapedData = { ...scrapedData, ...data };
             }
          }
      }

      // Safely map driver properties if they were overridden or missing
      if (apiData.driver) {
          scrapedData.energy = apiData.driver.energy;
          scrapedData.concentration = apiData.driver.concentration;
          scrapedData.stamina = apiData.driver.stamina;
          scrapedData.experience = apiData.driver.experience;
          scrapedData.weight = apiData.driver.weight;
          scrapedData.aggressiveness = apiData.driver.aggressiveness;
          scrapedData.talent = apiData.driver.talent;
          scrapedData.techInsight = apiData.driver.techInsight;
          scrapedData.charisma = apiData.driver.charisma;
          scrapedData.motivation = apiData.driver.motivation;
      }

      if (!scrapedData.energy && !scrapedData.carPower) {
         throw new Error("GPRO API Fetch failed or empty data. Token may be invalid.");
      }
      
      // Save directly to raw driverStats collection for cloud persistence
      if (currentUser && currentUser.uid && scrapedData.concentration !== undefined) {
         try {
            const { serverTimestamp } = await import('firebase/firestore');
            await setDoc(doc(db, 'driverStats', currentUser.uid), {
                userId: currentUser.uid,
                energy: scrapedData.energy || 0,
                focus: scrapedData.concentration || 0,
                stamina: scrapedData.stamina || 0,
                experience: scrapedData.experience || 0,
                weight: scrapedData.weight || 0,
                updatedAt: serverTimestamp()
            }, { merge: true });
         } catch (firebaseErr) {
            console.error("Failed to persist raw Driver Stats to Cloud:", firebaseErr);
         }
      }

      const opt = settings.apiSyncOptions || { driver: true, car: true, track: true, weather: true, risks: true, ignoreFiltersAuto: true };
      const applyFilters = isAuto ? !opt.ignoreFiltersAuto : true; // If auto and ignore is true, apply all. Otherwise use filters.
      
      const checkFilter = (key) => applyFilters ? (opt[key] !== false) : true;

      // Prepare preview data based on filters
      const previewObj: any = {};
      if (checkFilter('driver') && apiData.driver) {
         previewObj.driver = {
            energy: apiData.driver.energy,
            focus: apiData.driver.concentration,
            stamina: apiData.driver.stamina,
            experience: apiData.driver.experience,
            weight: apiData.driver.weight,
            aggression: apiData.driver.aggressiveness,
            talent: apiData.driver.talent,
            techInsight: apiData.driver.techInsight,
            charisma: apiData.driver.charisma,
            motivation: apiData.driver.motivation,
            salary: apiData.driver.salary,
            overall: apiData.driver.overall || apiData.office?.driOA
         };
      }
      
      const carSrc = apiData.carUpdate || apiData.practice || {};
      if (checkFilter('car')) {
         previewObj.car = {
            power: carSrc.carPower,
            handling: carSrc.carHandl,
            acceleration: carSrc.carAccel,
            wear: {
               chassis: carSrc.usaChassis,
               engine: carSrc.usaEngine,
               frontWing: carSrc.usaFWing,
               rearWing: carSrc.usaRWing,
               underbody: carSrc.usaUnderbody,
               sidepods: carSrc.usaSidepods,
               cooling: carSrc.usaCooling,
               gearbox: carSrc.usaGear,
               brakes: carSrc.usaBrakes,
               suspension: carSrc.usaSusp
            },
            levels: {
               chassis: carSrc.lvlChassis,
               engine: carSrc.lvlEngine,
               frontWing: carSrc.lvlFWing,
               rearWing: carSrc.lvlRWing,
               underbody: carSrc.lvlUnderbody,
               sidepods: carSrc.lvlSidepods,
               cooling: carSrc.lvlCooling,
               gearbox: carSrc.lvlGear,
               brakes: carSrc.lvlBrakes,
               suspension: carSrc.lvlSusp
            }
         };
      }
      
      const trackSrc = apiData.trackProfile || apiData.practice || apiData.setup || {};
      if (checkFilter('track') && (trackSrc.trackId || trackSrc.trackName || trackSrc.name)) {
         previewObj.track = { 
             id: trackSrc.trackId || trackSrc.id, 
             name: trackSrc.trackName || trackSrc.name,
             power: trackSrc.power || trackSrc.trackPower,
             accel: trackSrc.accel || trackSrc.trackAccel,
             handl: trackSrc.handl || trackSrc.trackHandl,
             laps: trackSrc.laps || apiData.setup?.laps,
             lapDistance: trackSrc.lapDistance,
             downforce: trackSrc.downforce,
             overtaking: trackSrc.overtaking,
             suspRigidity: trackSrc.suspRigidity,
             fuelConsumption: trackSrc.fuelConsumption,
             tyreWear: trackSrc.tyreWear
         };
      }
      
      const weatherSrc = apiData.setup?.weather || apiData.practice?.weather;
      if (checkFilter('weather') && weatherSrc) {
         previewObj.weather = {
            q1Temp: weatherSrc.q1Temp,
            q2Temp: weatherSrc.q2Temp,
            raceTempLow: weatherSrc.raceQ1TempLow,
            raceTempHigh: weatherSrc.raceQ4TempHigh || weatherSrc.raceQ1TempHigh,
            q1Weather: weatherSrc.q1Weather,
            q2Weather: weatherSrc.q2Weather,
            rainProps: {
                q1: weatherSrc.q1Weather?.toLowerCase().includes('rain') ? 100 : 0,
                q2_r1: weatherSrc.raceQ1RainPHigh !== undefined ? Math.round((weatherSrc.raceQ1RainPLow + weatherSrc.raceQ1RainPHigh) / 2) : undefined,
                r2: weatherSrc.raceQ2RainPHigh !== undefined ? Math.round((weatherSrc.raceQ2RainPLow + weatherSrc.raceQ2RainPHigh) / 2) : undefined,
                r3: weatherSrc.raceQ3RainPHigh !== undefined ? Math.round((weatherSrc.raceQ3RainPLow + weatherSrc.raceQ3RainPHigh) / 2) : undefined,
                r4: weatherSrc.raceQ4RainPHigh !== undefined ? Math.round((weatherSrc.raceQ4RainPLow + weatherSrc.raceQ4RainPHigh) / 2) : undefined,
            }
         };
      }
      
      if (checkFilter('risks')) {
         previewObj.risks = {
            overtake: scrapedData.riskOvertake,
            defend: scrapedData.riskBlock,
            clearDry: scrapedData.riskClearDry,
            clearWet: scrapedData.riskClearWet,
            malfunction: scrapedData.riskTechProb
         };
      }

      if (apiData.staff) {
          previewObj.staff = {
              overall: apiData.staff.overall,
              concentration: apiData.staff.concentration,
              experience: apiData.staff.experience,
              technical: apiData.staff.technical,
              stressHandling: apiData.staff.stressHandling,
              efficiency: apiData.staff.efficiency,
              salary: apiData.staff.salary
          };
      }

      if (apiData.office) {
          previewObj.manager = {
              cash: apiData.office.cash,
              tyreSupplierId: apiData.office.tyreSupplierId,
              qualSGPos: apiData.office.qualSGPos,
              classStr: apiData.office.class
          };
      }
      
      if (apiData.practice && apiData.practice.lapsDone) {
          previewObj.practiceLaps = apiData.practice.lapsDone;
      }
      if (apiData.testing && apiData.testing.stints) {
          previewObj.testingStints = apiData.testing.stints;
      }

      if (apiData.testing) {
          previewObj.testing = apiData.testing;
      }

      if (isAuto) {
         // Auto-apply silently
         applyApiDataFn(previewObj, isAuto);
         setLocalSettings(s => ({ ...s, lastApiSyncTime: Date.now() }));
      } else {
         // Manual mode: Show Verification Preview
         setApiPreview(previewObj);
      }
    } catch (err) {
      console.error(err);
      if (!isAuto) alert(t("API Error: ") + err.message);
    } finally {
      setIsSyncing(false);
      if (!isAuto) setTimeout(() => setSyncStatus(''), 2000);
    }
  };

  const applyApiDataFn = (dataPreview, isAuto = false) => {
     setPlayer(p => {
         const newP = { ...p };
         let changed = false;
         
         if (dataPreview.driver) {
             const d = dataPreview.driver;
             if (d.energy !== undefined && newP.energy !== d.energy) { newP.energy = d.energy; changed = true; }
             if (d.focus !== undefined && newP.driverFocus !== d.focus) { newP.driverFocus = d.focus; changed = true; }
             if (d.stamina !== undefined && newP.driverStamina !== d.stamina) { newP.driverStamina = d.stamina; changed = true; }
             if (d.experience !== undefined && newP.driverExperience !== d.experience) { newP.driverExperience = d.experience; changed = true; }
             if (d.aggression !== undefined && newP.riskAggression !== d.aggression) { newP.riskAggression = d.aggression; changed = true; }
         }
         if (dataPreview.car) {
             if (dataPreview.car.power !== undefined && newP.carPower !== dataPreview.car.power) { newP.carPower = dataPreview.car.power; changed = true; }
             if (dataPreview.car.handling !== undefined && newP.carHandling !== dataPreview.car.handling) { newP.carHandling = dataPreview.car.handling; changed = true; }
             if (dataPreview.car.acceleration !== undefined && newP.carAcceleration !== dataPreview.car.acceleration) { newP.carAcceleration = dataPreview.car.acceleration; changed = true; }
             const wear = dataPreview.car.wear;
             if (wear && wear.chassis !== undefined) {
                 if (!newP.carWear) newP.carWear = {};
                 newP.carWear = { ...wear };
                 changed = true;
             }
             const levels = dataPreview.car.levels;
             if (levels && levels.chassis !== undefined) {
                 if (!newP.carParts) newP.carParts = {};
                 newP.carParts = { ...levels };
                 changed = true;
             }
         }
         if (dataPreview.manager) {
             if (dataPreview.manager.tyreSupplierId) {
                const map: Record<number, string> = { 1: 'Pipirelli', 2: 'Avonn', 3: 'Contimental', 4: 'Dunnolop', 5: 'Yokohama', 6: 'Michelin', 7: 'Bridgestone', 8: 'Hancock', 9: 'Badyear' };
                const supplier = map[dataPreview.manager.tyreSupplierId];
                if (supplier && newP.tyreSupplier !== supplier) {
                   newP.tyreSupplier = supplier;
                   changed = true;
                }
             }
             if (dataPreview.manager.qualSGPos && dataPreview.manager.qualSGPos !== '-') {
                const pos = parseInt(dataPreview.manager.qualSGPos);
                if (!isNaN(pos) && newP.startPosition !== pos) {
                   newP.startPosition = pos;
                   changed = true;
                }
             }
             if (dataPreview.manager.classStr) {
                const c = dataPreview.manager.classStr.toLowerCase();
                let lg: any = null;
                if (c === 'ro') lg = 'Rookie';
                else if (c === 'am') lg = 'Amateur';
                else if (c === 'pr') lg = 'Pro';
                else if (c === 'ma') lg = 'Master';
                else if (c === 'el') lg = 'Elite';
                if (lg && newP.league !== lg) {
                   newP.league = lg;
                   changed = true;
                }
             }
         }
         if (dataPreview.risks) {
             const r = dataPreview.risks;
             if (!newP.risks) newP.risks = { overtake: 0, defend: 0, clearDry: 0, clearWet: 0, malfunction: 0 };
             if (r.overtake !== undefined && newP.risks.overtake !== r.overtake) { newP.risks.overtake = r.overtake; changed = true; }
             if (r.defend !== undefined && newP.risks.defend !== r.defend) { newP.risks.defend = r.defend; changed = true; }
             if (r.clearDry !== undefined && newP.risks.clearDry !== r.clearDry) { newP.risks.clearDry = r.clearDry; changed = true; }
             if (r.clearWet !== undefined && newP.risks.clearWet !== r.clearWet) { newP.risks.clearWet = r.clearWet; changed = true; }
             if (r.malfunction !== undefined && newP.risks.malfunction !== r.malfunction) { newP.risks.malfunction = r.malfunction; changed = true; }
         }
         return changed ? newP : p;
     });

     if (dataPreview.track && dataPreview.track.name) {
         // Auto-select track if match found
         const match = TRACK_DATABASE.find(t => t.name.toLowerCase() === dataPreview.track.name.toLowerCase());
         if (match) {
             setSelectedTrackId(match.id);
         }
     }
     
     if (dataPreview.weather) {
         setWeather(w => {
            let nw = { ...w };
            let changed = false;
            if (dataPreview.weather.raceTempLow !== undefined) {
               const avg = (dataPreview.weather.raceTempLow + dataPreview.weather.raceTempHigh) / 2;
               if (!isNaN(avg)) {
                  nw.tempBase = dataPreview.weather.raceTempLow;
                  nw.tempMax = dataPreview.weather.raceTempHigh;
                  changed = true;
               }
            }
            if (dataPreview.weather.rainProps) {
               if (!nw.rainProps) nw.rainProps = { q1: 0, q2_r1: 0, r2: 0, r3: 0, r4: 0 };
               nw.rainProps = { ...nw.rainProps };
               
               if (dataPreview.weather.rainProps.q1 !== undefined) { nw.rainProps.q1 = dataPreview.weather.rainProps.q1; changed = true; }
               if (dataPreview.weather.rainProps.q2_r1 !== undefined) { nw.rainProps.q2_r1 = dataPreview.weather.rainProps.q2_r1; changed = true; }
               if (dataPreview.weather.rainProps.r2 !== undefined) { nw.rainProps.r2 = dataPreview.weather.rainProps.r2; changed = true; }
               if (dataPreview.weather.rainProps.r3 !== undefined) { nw.rainProps.r3 = dataPreview.weather.rainProps.r3; changed = true; }
               if (dataPreview.weather.rainProps.r4 !== undefined) { nw.rainProps.r4 = dataPreview.weather.rainProps.r4; changed = true; }
            }
            return changed ? nw : w;
         });
     }

     if (!isAuto) {
         setApiPreview(null);
         setSyncStatus(t('Veriler Güncellendi!'));
         setTimeout(() => setSyncStatus(''), 3000);
         if (appView !== 'calculator') setAppView('calculator');
     }
  };

  const guessCurrentTrack = async (isAuto = false) => {
    try {
      const now = Date.now();
      
      if (isAuto) {
         // Respect the same time window as auto-sync: 
         // between 2 hours after last race and 1.5 hours before next race
         const pastRaces = F1_CALENDAR_S113.filter(r => new Date(r.date).getTime() < now);
         const nextRaces = F1_CALENDAR_S113.filter(r => new Date(r.date).getTime() >= now);
         if (pastRaces.length > 0 && nextRaces.length > 0) {
             const lastRaceTime = new Date(pastRaces[pastRaces.length - 1].date).getTime();
             const nextRaceTime = new Date(nextRaces[0].date).getTime();
             if (!(now > lastRaceTime + 2 * 3600 * 1000 && now < nextRaceTime - 1.5 * 3600 * 1000)) {
                 return; // Do not auto-fetch calendar during race window
             }
         }
      }
      
      if (!isAuto) setSyncStatus(t('Fetching F1 calendar...'));
      
      let calendarToUse = F1_CALENDAR_S113;



      let nextRace = calendarToUse.find(r => new Date(r.date).getTime() > now);
      
      if (!nextRace && calendarToUse.length > 0) {
         nextRace = calendarToUse[0]; // fallback if year ended
      }

      if (nextRace) {
         setNextRaceName(nextRace.name);
         setNextRaceTime(new Date(nextRace.date).getTime());
         
         setLocalSettings(s => {
             if (s.prepCycleId && s.prepCycleId !== nextRace.name) {
                 return {
                     ...s,
                     prepCycleId: nextRace.name,
                     prepFieldsLastUpdated: {}
                 };
             } else if (!s.prepCycleId) {
                 return { ...s, prepCycleId: nextRace.name };
             }
             return s;
         });
         
         if (!isAuto || (isAuto && !customTrack && selectedTrackId === 'melbourne')) {
            // Find matched track in our db
            let matchedId = 'montreal';
            const dbIds = TRACK_DATABASE.map(t => t.id);
            if (dbIds.includes(nextRace.id)) {
               matchedId = nextRace.id;
            } else if (nextRace.name.toLowerCase().includes("australia")) {
               matchedId = 'melbourne';
            }
            setSelectedTrackId(matchedId);
            if (!isAuto) { setSyncStatus(t("Calendar Sync:") + " " + nextRace.name); setTimeout(() => setSyncStatus(""), 4000); }
         }
      }
    } catch (e) {
      console.error("Calendar fetch error:", e);
      if (!isAuto) {
         { setSyncStatus(t("Calendar disconnected or error occurred.")); setTimeout(() => setSyncStatus(""), 4000); }
      }
    } finally {
      if (!isAuto) setTimeout(() => setSyncStatus(''), 2000);
    }
  };

  useEffect(() => {
    // Auto-fetch on boot
    guessCurrentTrack(true);
  }, []);

  useEffect(() => {
    const performAutoSync = async () => {
       if (!settings.autoApiSync || !settings.gproToken) return;

       const now = Date.now();
       const pastRaces = F1_CALENDAR_S113.filter(r => new Date(r.date).getTime() < now);
       const nextRaces = F1_CALENDAR_S113.filter(r => new Date(r.date).getTime() >= now);
       const lastRace = pastRaces[pastRaces.length - 1];
       const nextRace = nextRaces[0];

       if (lastRace && nextRace) {
          const twoHoursAfterLastRace = new Date(lastRace.date).getTime() + 2 * 60 * 60 * 1000;
          const oneAndHalfHoursBeforeNextRace = new Date(nextRace.date).getTime() - 1.5 * 60 * 60 * 1000;

          if (now >= twoHoursAfterLastRace && now <= oneAndHalfHoursBeforeNextRace) {
             if (!settings.lastApiSyncTime || settings.lastApiSyncTime < twoHoursAfterLastRace) {
                await fetchGproApi(true);
             }
          }
       }
    };
    performAutoSync();
  }, [settings.autoApiSync, settings.gproToken, settings.lastApiSyncTime]);

  // Setup OCR and others...
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [ocrPreview, setOcrPreview] = useState<{
    tempBase?: number;
    tempMax?: number;
    rainProps?: { q1: number, q2_r1: number, r2: number, r3: number, r4: number };
    driverFocus?: number;
    driverStamina?: number;
    driverExperience?: number;
    riskAggression?: number;
    driverWeight?: number;
  } | null>(null);

  const extractNumberNearKeyword = (text: string, keywords: string[]): number | null => {
    const lowerText = text.toLowerCase().replace(/\n/g, ' ');
    for (const keyword of keywords) {
      // Look for keyword then number
      const regex1 = new RegExp(`${keyword}[^0-9a-z]{0,20}(\\d+)`, 'i');
      const match1 = lowerText.match(regex1);
      if (match1 && match1[1]) return parseInt(match1[1], 10);
      // Look for number then keyword
      const regex2 = new RegExp(`(\\d+)[^0-9a-z]{0,20}${keyword}`, 'i');
      const match2 = lowerText.match(regex2);
      if (match2 && match2[1]) return parseInt(match2[1], 10);
    }
    return null;
  };

  const processImage = async (file: File) => {
    setIsOCRProcessing(true);
    setOcrStatus('Scanning image, please wait. Clearly cropped images give better results.');
    setOcrPreview(null);
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`Okunuyor: %${(m.progress * 100).toFixed(0)}`);
          }
        }
      });
      const text = result.data.text;
      
      const parsedData: any = {};
      
      // Heuristics for Temperature (e.g. 15° - 25° or 15-25)
      const tempRegex = /(\d{1,2})\s*[-~|]\s*(\d{1,2})\s*°?C?/i;
      const tempMatch = text.match(tempRegex);
      if (tempMatch) {
         if (parseInt(tempMatch[1], 10) < 50) parsedData.tempBase = parseInt(tempMatch[1], 10);
         if (parseInt(tempMatch[2], 10) < 50) parsedData.tempMax = parseInt(tempMatch[2], 10);
      } else {
         // Fallback to keyword search
         const tempT1 = extractNumberNearKeyword(text, ['min temp', 'min sıcaklık', 'temperature', 'sıcaklık', 'temp', 'hava']);
         if (tempT1 && tempT1 < 50) parsedData.tempBase = tempT1;
         
         const tempT2 = extractNumberNearKeyword(text, ['max temp', 'max sıcaklık', 'highest']);
         if (tempT2 && tempT2 < 50) parsedData.tempMax = tempT2;
      }

      // Heuristics for Rain Probabilities (%)
      const percRegex = /(\d{1,3})\s*%/g;
      const percs = Array.from(text.matchAll(percRegex)).map(m => parseInt(m[1], 10));
      if (percs.length >= 2) {
         // Some players screenshot all 6 fields, some 5 if merged. We'll handle safely:
         parsedData.rainProps = {
            q1: percs[0] || 0,
            q2_r1: percs[1] || 0,
            // If they provided 6 inputs, r1 is percs[2] but we merged q2 and r1, so take percs[1].
            // Usually r2 would be percs[3], etc. Let's just shift safely:
            r2: percs.length > 5 ? (percs[3] || 0) : (percs[2] || 0),
            r3: percs.length > 5 ? (percs[4] || 0) : (percs[3] || 0),
            r4: percs.length > 5 ? (percs[5] || 0) : (percs[4] || 0),
         };
      }
      
      // Extract specific fields contextually
      const dWeight = extractNumberNearKeyword(text, ['weight', 'ağırlık', 'kilo']);
      if (dWeight && dWeight > 40 && dWeight < 150) parsedData.driverWeight = dWeight;
      
      const focus = extractNumberNearKeyword(text, ['concentration', 'konsantrasyon']);
      if (focus) parsedData.driverFocus = focus;
      
      const stamina = extractNumberNearKeyword(text, ['stamina', 'dayanıklılık']);
      if (stamina) parsedData.driverStamina = stamina;
      
      const experience = extractNumberNearKeyword(text, ['experience', 'deneyim', 'tecrübe']);
      if (experience) parsedData.driverExperience = experience;
      
      const risk = extractNumberNearKeyword(text, ['risk', 'agresiflik', 'agressiandness', 'aggression']);
      if (risk && risk <= 100) parsedData.riskAggression = risk;
      
      if (Object.keys(parsedData).length > 0) {
         setOcrPreview(parsedData);
         setOcrStatus('Important data detected. Awaiting your confirmation.');
      } else {
         setOcrStatus(t('No clear data found, try cropping the area more precisely.'));
         setTimeout(() => setOcrStatus(''), 4000);
      }
    } catch (e) {
      console.error(e);
      setOcrStatus(t('Error!'));
      addSystemLog('Akıllı Görüntü Okuma Hatası', 'Ekran görüntüsü okunamadı: ' + (e as Error).message, 'patch-note');
      setTimeout(() => setOcrStatus(''), 3000);
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const applyOcrData = () => {
    if (!ocrPreview) return;
    if (ocrPreview.tempBase) setWeather(w => ({ ...w, tempBase: ocrPreview.tempBase! }));
    if (ocrPreview.tempMax) setWeather(w => ({ ...w, tempMax: ocrPreview.tempMax! }));
    if (ocrPreview.rainProps) setWeather(w => ({ ...w, rainProps: ocrPreview.rainProps! }));
    
    // Only update if there are determined fields
    const hasPlayerUpdates = ocrPreview.driverFocus !== undefined || ocrPreview.driverStamina !== undefined || ocrPreview.driverExperience !== undefined || ocrPreview.riskAggression !== undefined;
    
    if (ocrPreview.driverWeight !== undefined) {
      setConstants(c => ({...c, driverWeight: ocrPreview.driverWeight!}));
    }
    
    if (hasPlayerUpdates) {
      setPlayer(p => ({
          ...p,
          ...(ocrPreview.driverFocus !== undefined ? { driverFocus: ocrPreview.driverFocus } : {}),
          ...(ocrPreview.driverStamina !== undefined ? { driverStamina: ocrPreview.driverStamina } : {}),
          ...(ocrPreview.driverExperience !== undefined ? { driverExperience: ocrPreview.driverExperience } : {}),
          ...(ocrPreview.riskAggression !== undefined ? { riskAggression: ocrPreview.riskAggression } : {}),
      }));
    }
    
    setOcrPreview(null);
    setOcrStatus('Veriler başarıyla oyuna işlendi!');
    setTimeout(() => setOcrStatus(''), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            if (evt.target?.result) {
              const data = JSON.parse(evt.target.result as string);
              setPlayer(data);
              setSyncStatus(t('Loaded successfully!'));
              setTimeout(() => setSyncStatus(''), 3000);
            }
          } catch(err) {
            alert(t('Invalid file format.'));
          }
        };
        reader.readAsText(file);
      } else {
        processImage(file);
      }
    }
  };

  const activeTrack = useMemo(() => selectedTrackId === 'custom' 
    ? customTrack 
    : TRACK_DATABASE.find(t => t.id === selectedTrackId)!, [selectedTrackId, customTrack]);

  // Parameters for {t('Calculator')}
  const calcParams: CalcParams = useMemo(() => ({
    track: activeTrack,
    weather,
    player,
    weightPenaltyPerLiter: (constants.driverWeight * 0.00045),
    pitRefuelRate: constants.pitRefuelRate
  }), [activeTrack, weather, player, constants]);

  // Deriandd Variables for UI Info
  const estFuelPerLap = calculateFuelPerLap(calcParams);

  // Strategy Results
  const results = useMemo(() => analyzeStrategies(calcParams), [calcParams]);

  const [selectedStratIndex, setSelectedStratIndex] = useState(0);


  useEffect(() => {
    setSelectedStratIndex(0);
  }, [results]);

  const bestStrategy = results.length > 0 ? results[0] : null;
  const baseSelectedStrategy = results[selectedStratIndex] || bestStrategy;

  const handleDownloadProtocol = () => {
    if (!baseSelectedStrategy) return;
    const lines = [];
    lines.push(`--- GPRO Strategy Summary ---`);
    lines.push(`Track: ${activeTrack.name} (${activeTrack.laps} Laps | ${activeTrack.distance} km)`);
    lines.push(`Driver: ${player.name}`);
    lines.push(`Temperature: ${weather.tempMax}°C | Rain Prob: ${weather.rainProps ? Math.max(weather.rainProps.q1, weather.rainProps.q2_r1, weather.rainProps.r2, weather.rainProps.r3, weather.rainProps.r4) : 0}%`);
    lines.push(`Total Stops: ${baseSelectedStrategy.stops}`);
    lines.push(`Estimated Relative Race Time: +${baseSelectedStrategy.totalRaceTime.toFixed(1)} sec`);
    lines.push(``);
    baseSelectedStrategy.stints.forEach((stint, idx) => {
       lines.push(`Stint ${idx + 1}:`);
       lines.push(`  Tyres: ${stint.tyres} (${COMPOUND_FULL_NAMES[stint.tyres]})`);
       lines.push(`  Laps: ${stint.laps} Laps`);
       lines.push(`  Est. End Wear: ${stint.wearEnd.toFixed(1)}%`);
       lines.push(`  Est. Required Fuel: ${stint.fuelNeeded.toFixed(1)} L`);
    });
    lines.push(``);
    lines.push(`Generated by Pitwall Pro`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPRO_Strategy_${activeTrack.id}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyProtocol = async () => {
    if (!baseSelectedStrategy) return;
    const lines = [];
    lines.push(`⏱️ *GPRO Strategy: ${activeTrack.name}*`);
    lines.push(`🚗 *Driver:* ${player.name}`);
    lines.push(`🌡️ *Temp:* ${weather.tempMax}°C | *Rain Prob:* ${weather.rainProps ? Math.max(weather.rainProps.q1, weather.rainProps.q2_r1, weather.rainProps.r2, weather.rainProps.r3, weather.rainProps.r4) : 0}%`);
    lines.push(`-------------------`);
    baseSelectedStrategy.stints.forEach((s, idx) => {
       lines.push(`*S${idx + 1}:* ${s.laps} Laps | ${COMPOUND_FULL_NAMES[s.tyres]} | ⛽ ${s.fuelNeeded.toFixed(1)}L | 🔧 ${s.wearEnd.toFixed(0)}%`);
    });
    lines.push(`-------------------`);
    lines.push(`PITWALL PRO`);
    
    try {
       await navigator.clipboard.writeText(lines.join('\n'));
       alert(t("Strategy copied to clipboard!"));
    } catch (err) {
       console.error("Failed to copy text", err);
    }
  };

  const [manualStintLaps, setManualStintLaps] = useState<number[] | null>(null);

  useEffect(() => {
    if (baseSelectedStrategy) {
       setManualStintLaps(baseSelectedStrategy.stints.map(s => s.laps));
    } else {
       setManualStintLaps(null);
    }
  }, [selectedStratIndex, results, activeTrack.name]);

  const selectedStrategy = useMemo(() => {
    if (!baseSelectedStrategy || !manualStintLaps || manualStintLaps.length !== baseSelectedStrategy.stints.length) return baseSelectedStrategy;
    
    let currentLap = 0;
    let validStr: string | true = true;
    let totalRelativeTime = 0;
    const newStints: any[] = [];
    
    for (let i = 0; i < manualStintLaps.length; i++) {
        const laps = manualStintLaps[i];
        const compound = baseSelectedStrategy.stints[i].tyres;
        const stintSim = simulateStint(laps, compound, calcParams, currentLap);
        
        newStints.push({
            laps,
            tyres: compound,
            fuelStart: stintSim.fuelNeeded,
            fuelNeeded: stintSim.fuelNeeded,
            wearEnd: stintSim.wearEnd
        });
        
        currentLap += laps;
        totalRelativeTime += stintSim.timeCost;
        if (stintSim.wearEnd > 99) validStr = "Overwear Risk (>99%)";
        if (stintSim.fuelNeeded > 180) validStr = "Fuel Tank Exceeded (>180L)";
        
        // Add refuel penalties
        if (i < manualStintLaps.length - 1) {
            const pitTime = calcParams.track.pitTimeBase + (simulateStint(manualStintLaps[i+1], baseSelectedStrategy.stints[i+1].tyres, calcParams, currentLap).fuelNeeded / calcParams.pitRefuelRate);
            totalRelativeTime += pitTime;
        }
    }
    
    return {
        stops: baseSelectedStrategy.stops,
        totalRaceTime: totalRelativeTime,
        stints: newStints,
        _isManualValid: validStr 
    };
  }, [baseSelectedStrategy, manualStintLaps, calcParams]);
  
  const fuelGraphData = useMemo(() => {
    if (!selectedStrategy) return [];
    let data: any[] = [];
    let currentLap = 0;
    selectedStrategy.stints.forEach((stint, idx) => {
      if (idx > 0) {
         data.push({ lap: currentLap, remaining: null, stint: 'Pit Stop' });
      }
      const fuelPerLap = stint.fuelNeeded / stint.laps;
      for (let i = 0; i <= stint.laps; i++) {
        data.push({
          lap: currentLap + i,
          remaining: hiddenStints.includes(idx) ? null : parseFloat((stint.fuelStart - (fuelPerLap * i)).toFixed(2)),
          stint: `Stint ${idx + 1}`
        });
      }
      currentLap += stint.laps;
    });
    return data;
  }, [selectedStrategy, hiddenStints]);

  const wearGraphData = useMemo(() => {
    if (!selectedStrategy) return [];
    let data: any[] = [];
    let currentLap = 0;
    selectedStrategy.stints.forEach((stint, idx) => {
      if (idx > 0) {
         data.push({ lap: currentLap, remaining: null, stint: 'Pit Stop' });
      }
      const wearPerLap = stint.wearEnd / stint.laps;
      for (let i = 0; i <= stint.laps; i++) {
        data.push({
          lap: currentLap + i,
          remaining: hiddenStints.includes(idx) ? null : parseFloat((100 - (wearPerLap * i)).toFixed(2)),
          stint: `Stint ${idx + 1} (${COMPOUND_FULL_NAMES[stint.tyres]})`
        });
      }
      currentLap += stint.laps;
    });
    return data;
  }, [selectedStrategy, hiddenStints]);

  if (isAppInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-indigo-100 flex flex-col max-lg:data-[landscape=true]:flex-row transition-colors ${'bg-slate-50/50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-100'}`}>
      <header className={`backdrop-blur-md border-b dark:border-slate-700 max-lg:data-[landscape=true]:border-b-0 max-lg:data-[landscape=true]:border-r sticky top-0 z-[60] shadow-sm flex-none max-lg:data-[landscape=true]:h-screen max-lg:data-[landscape=true]:w-64 max-lg:data-[landscape=true]:overflow-y-auto ${'bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 max-lg:data-[landscape=true]:h-full max-lg:data-[landscape=true]:px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center py-3 gap-3 max-lg:data-[landscape=true]:flex-col max-lg:data-[landscape=true]:items-start max-lg:data-[landscape=true]:py-6 max-lg:data-[landscape=true]:h-full">
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between max-lg:data-[landscape=true]:mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm shadow-indigo-200/50">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-black tracking-tight flex items-baseline gap-1">Pitwall <span className="text-indigo-600">Pro</span> <span className="text-sm font-normal text-slate-400/70 dark:text-slate-500/70 tracking-normal ml-1">d1.1.5</span></h1>
                </div>
              </div>
              <div className="lg:hidden flex items-center gap-3 max-lg:data-[landscape=true]:hidden">
                 <button onClick={toggleNotifications} className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition relative shadow-sm border border-slate-200 dark:border-slate-700">
                   <Bell className="w-5 h-5" />
                   {hasUnreadNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>}
                 </button>
                 <button onClick={toggleMenu} className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm border border-slate-200 dark:border-slate-700">
                   <Menu className="w-5 h-5" />
                 </button>
              </div>
            </div>
            
            {appView === 'calculator' && (
              <div className="flex flex-row p-0.5 sm:p-1.5 rounded-2xl border dark:border-slate-800/80 w-full lg:w-auto shadow-inner relative z-10 transition-all gap-0.5 sm:gap-0 bg-slate-100/80 dark:bg-[#0f172a]/60 backdrop-blur-xl border-slate-200/60 justify-between sm:justify-start">
                <button 
                  className={`flex-1 sm:flex-none py-1 sm:py-2 px-1 sm:px-4 sm:mx-0.5 font-bold text-[9px] min-[380px]:text-[10px] sm:text-sm rounded-[10px] sm:rounded-xl transition-all relative w-full sm:w-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0 sm:gap-2 ${activeTab === 'home' ? 'bg-white dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-md border border-slate-200/60 dark:border-indigo-500/30 scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm scale-95 hover:scale-100'}`}
                  onClick={() => setActiveTab('home')}
                >
                  <span className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2"><Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('Dashboard')}</span>
                </button>
                <button 
                  className={`flex-1 sm:flex-none py-1 sm:py-2 px-1 sm:px-4 sm:mx-0.5 font-bold text-[9px] min-[380px]:text-[10px] sm:text-sm rounded-[10px] sm:rounded-xl transition-all relative w-full sm:w-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0 sm:gap-2 ${['track_setup', 'strategy'].includes(activeTab) ? 'bg-white dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-md border border-slate-200/60 dark:border-indigo-500/30 scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm scale-95 hover:scale-100'}`}
                  onClick={() => setActiveTab('strategy')}
                >
                  <span className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2"><Goal className="w-4 h-4" /> {t('Strategy & Track')}</span>
                </button>
                <button 
                  className={`flex-1 sm:flex-none py-1 sm:py-2 px-1 sm:px-4 sm:mx-0.5 font-bold text-[9px] min-[380px]:text-[10px] sm:text-sm rounded-[10px] sm:rounded-xl transition-all relative w-full sm:w-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0 sm:gap-2 ${['driver_profile', 'economy'].includes(activeTab) ? 'bg-white dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-md border border-slate-200/60 dark:border-indigo-500/30 scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm scale-95 hover:scale-100'}`}
                  onClick={() => setActiveTab('driver_profile')}
                >
                  <span className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2"><User className="w-4 h-4" /> {t('Garage & Economy')}</span>
                </button>
                <button 
                  className={`flex-1 sm:flex-none py-1 sm:py-2 px-1 sm:px-4 sm:mx-0.5 font-bold text-[9px] min-[380px]:text-[10px] sm:text-sm rounded-[10px] sm:rounded-xl transition-all relative w-full sm:w-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0 sm:gap-2 ${['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) ? 'bg-white dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-md border border-slate-200/60 dark:border-indigo-500/30 scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm scale-95 hover:scale-100'}`}
                  onClick={() => setActiveTab('assistant')}
                >
                  <span className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2"><TrendingUp className="w-4 h-4" /> {t('Data & Assistant')}</span>
                </button>
              </div>
            )}
            
            <div className={`hidden lg:flex items-center gap-3 max-lg:data-[landscape=true]:flex max-lg:data-[landscape=true]:mt-auto`}>
               <button onClick={toggleNotifications} className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition relative shadow-sm border border-slate-200 dark:border-slate-700">
                 <Bell className="w-5 h-5" />
                 {hasUnreadNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>}
               </button>
               <button onClick={toggleMenu} className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm border border-slate-200 dark:border-slate-700">
                 <Menu className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 pb-24 pt-6 max-lg:data-[landscape=true]:h-screen max-lg:data-[landscape=true]:overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 lg:px-8 max-lg:data-[landscape=true]:px-6">

          {appView !== 'calculator' && (
            <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setAppView(appView === 'menu' ? 'calculator' : 'menu')} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:bg-slate-900 transition text-slate-600 dark:text-slate-400">
                     <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                     {appView === 'menu' ? t('App Menu') : appView === 'settings' ? t('Settings') : appView === 'notifications' ? t('Notifications') : appView === 'admin' ? 'System Diagnostics' : appView === 'integrations' ? t('Data Integrations') : `${t('Account')} & Sync`}
                  </h2>
               </div>
               
               {appView === 'menu' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button onClick={() => setAppView('settings')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition text-left flex flex-col gap-3 group">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl w-max group-hover:scale-110 transition"><MonitorSmartphone className="w-6 h-6" /></div>
                        <div>
                           <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t('Settings')}</h3>
                           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('Theme, language and notifications')}</p>
                        </div>
                     </button>
                     <button onClick={() => setAppView('account')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 transition text-left flex flex-col gap-3 group">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl w-max group-hover:scale-110 transition"><CloudCog className="w-6 h-6" /></div>
                        <div>
                           <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t('Account & Sync')}</h3>
                           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('Backup and sync data to cloud or sync between devices')}</p>
                        </div>
                     </button>
                     <button onClick={() => setAppView('simulation')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition text-left flex flex-col gap-3 group">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl w-max group-hover:scale-110 transition"><Activity className="w-6 h-6" /></div>
                        <div>
                           <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">Simulation Engine <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 font-bold uppercase rounded-md tracking-wider">Lab</span></h3>
                           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Test race conditions and strategies. Open to all for now during early development.</p>
                        </div>
                     </button>
                     <button onClick={() => setAppView('integrations')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500 transition text-left flex flex-col gap-3 group">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl w-max group-hover:scale-110 transition"><Activity className="w-6 h-6" /></div>
                        <div>
                           <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t('Data Integrations')}</h3>
                           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('Import data via OCR or API')}</p>
                        </div>
                     </button>
                     {currentUser?.email === 'burakis204@gmail.com' && (
                        <button onClick={() => setAppView('admin')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 transition text-left flex flex-col gap-3 group">
                           <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl w-max group-hover:scale-110 transition"><Activity className="w-6 h-6" /></div>
                           <div>
                              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t('Admin Panel')}</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('Manage global app settings')}</p>
                           </div>
                        </button>
                     )}
                  </div>
               )}
               {appView === 'settings' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-6 relative">
                     <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><MonitorSmartphone className="w-5 h-5 text-indigo-500" /> {t('Appearance Settings')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                           <button 
                             onClick={() => setLocalSettings({...settings, theme: 'light'})}
                             className={`p-4 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-2 text-sm transition ${settings.theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400 dark:border-slate-700 dark:text-slate-400'}`}
                           >
                             Light Theme
                           </button>
                           <button 
                             onClick={() => setLocalSettings({...settings, theme: 'dark'})}
                             className={`p-4 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-2 text-sm transition ${settings.theme === 'dark' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400 dark:border-slate-700 dark:text-slate-400'}`}
                           >
                             Dark Theme
                           </button>
                           <button 
                             onClick={() => setLocalSettings({...settings, theme: 'system'})}
                             className={`p-4 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-2 text-sm transition ${settings.theme === 'system' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400 dark:border-slate-700 dark:text-slate-400'}`}
                           >
                             System
                           </button>
                        </div>
                     </div>
                     <div className="h-px bg-slate-100 dark:bg-slate-900"></div>
                     <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 items-center flex gap-1">Preferences <Tooltip content="Optional app behaviors" /></h3>
                        <div className="space-y-3">
                           <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                              <div>
                                 <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">In-App Notifications <Tooltip content="Alerts for transitions" /></div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400">Pit time and wear alerts.</div>
                              </div>
                              <input 
                                 type="checkbox" 
                                 className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                                 checked={settings.notifications}
                                 onChange={e => setLocalSettings({...settings, notifications: e.target.checked})} 
                              />
                           </label>
                           <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl transition">
                              <div className="mb-2">
                                 <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">{t('Language')} / Dil </div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400">{t('Select your preferred language')}</div>
                              </div>
                              <select value={settings.language} onChange={e => setLocalSettings({...settings, language: e.target.value, autoTranslate: false})} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none"
                              >
                                 <option value="en">English</option>
                                 <option value="tr">Türkçe</option>
                              </select>
                           </div>
                           <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition mt-4">
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
                           </label>
                           <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                              <div>
                                 <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">Smart Sync <Tooltip content="Minimize cloud data transfer" /></div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400">Cloud save mode for calculations.</div>
                              </div>
                              <input 
                                 type="checkbox" 
                                 className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                                 checked={settings.smartSync}
                                 onChange={e => setLocalSettings({...settings, smartSync: e.target.checked})} 
                              />
                           </label>
                        </div>
                     </div>
                     <div className="mt-8 flex justify-end">
                        <button onClick={() => {
                           setAppView('notifications');
                        }} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-2 px-4 rounded-lg shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2 text-sm border border-slate-200 dark:border-slate-700">
                           <MessageSquare className="w-4 h-4" /> Give Feedback
                        </button>
                     </div>
                  </div>
               )}
               {appView === 'integrations' && (
                  <div className="max-w-xl mx-auto">
                      <DataIntegrationsPanel 
                         settings={settings} 
                         setLocalSettings={setLocalSettings} 
                         t={t}
                         fetchGproApi={() => fetchGproApi(false)}
                         isSyncing={isSyncing}
                         apiPreview={apiPreview}
                         setApiPreview={setApiPreview}
                         applyApiData={() => applyApiDataFn(apiPreview)}
                         fileInputRef={fileInputRef}
                         handleFileChange={handleFileChange}
                         isOCRProcessing={isOCRProcessing}
                         ocrStatus={ocrStatus}
                         ocrPreview={ocrPreview}
                         applyOcrData={applyOcrData}
                         setOcrPreview={setOcrPreview}
                      />
                  </div>
               )}
               {appView === 'account' && (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center">
                     <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full mb-4">
                        <CloudCog className="w-10 h-10 text-blue-500" />
                     </div>
                     <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Sync Module</h2>
                     <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-md">Backup your driver and car data to use across devices. </p>
                     
                     <div className="mt-8 w-full max-w-md bg-white dark:bg-slate-900">
                        {!currentUser ? (
                          
                          
                          
                          <div className="flex flex-col items-center gap-6 w-full px-2 sm:px-6 py-2">
                            <div className="text-center mb-2">
                               <h3 className="text-2xl font-display font-black tracking-tight text-slate-800 dark:text-slate-100">Giriş Yap / Kayıt Ol</h3>
                               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Stratejilerini ve ayarlarını buluta kaydet</p>
                            </div>
                            <form className="w-full flex flex-col gap-4" onSubmit={(e: any) => {
                                e.preventDefault();
                                const email = e.target.email.value;
                                const password = e.target.password.value;
                                const isSignUp = e.nativeEvent.submitter.name === 'signup';
                                
                                if (!email || !password) {
                                    alert('Lütfen email ve şifre girin.');
                                    return;
                                }

                                if (isSignUp) {
                                    createUserWithEmailAndPassword(auth, email, password)
                                      .then(() => setSyncStatus('Kayıt Başarılı!'))
                                      .catch(err => alert('Kayıt Hatası: ' + err.message));
                                } else {
                                    signInWithEmailAndPassword(auth, email, password)
                                      .then(() => setSyncStatus('Giriş Başarılı!'))
                                      .catch(err => alert('Giriş Hatası: ' + err.message));
                                }
                            }}>
                               <div className="space-y-3">
                                  <div className="relative">
                                     <input type="email" name="email" placeholder="Email Adresi" className="text-slate-800 dark:text-slate-100 w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800/80 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400 text-sm font-medium" required />
                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                     </div>
                                  </div>
                                  <div className="relative">
                                     <input type="password" name="password" placeholder="Şifre" className="text-slate-800 dark:text-slate-100 w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800/80 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400 text-sm font-medium" required />
                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="flex gap-3 mt-2">
                                  <button type="submit" name="login" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-sm">Giriş Yap</button>
                                  <button type="submit" name="signup" className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 text-sm shadow-sm">Kayıt Ol</button>
                               </div>
                               
                               <div className="text-center mt-1">
                                  <button type="button" onClick={() => {
                                      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                                      const email = emailInput?.value;
                                      if (!email) {
                                          alert('Şifre sıfırlama için önce email adresinizi yukarıya yazın.');
                                          return;
                                      }
                                      sendPasswordResetEmail(auth, email).then(() => alert('Şifre sıfırlama bağlantısı mailinize gönderildi.')).catch(err => alert('Hata: ' + err.message));
                                  }} className="text-xs text-slate-400 hover:text-indigo-500 font-medium transition-colors">Şifremi Unuttum</button>
                               </div>
                            </form>
                            
                            <div className="relative w-full flex items-center justify-center my-4">
                               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                               <div className="relative bg-white dark:bg-slate-900 px-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">VEYA</div>
                            </div>

                            <button 
                               onClick={() => signInWithPopup(auth, new GoogleAuthProvider()).catch(err => { if(err.code !== 'auth/cancelled-popup-request') alert(err.message); })} 
                               className="bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-3 w-full transition-all group"
                            >
                               <div className="p-1 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                               </div>
                               <span className="text-sm">Google ile Giriş Yap</span>
                            </button>
                          </div>


                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3 w-full bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                               <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg uppercase line-clamp-1">{currentUser.email?.[0]}</div>
                               <div className="flex-1 overflow-hidden" title={currentUser.email || ''}>
                                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.displayName || 'GPRO Player'}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                               </div>
                               <button onClick={() => signOut(auth)} className="text-xs text-red-500 hover:text-red-700 font-bold uppercase transition px-2">Logout</button>
                            </div>
                            
                            <div className="w-full space-y-3 mt-4 flex flex-col items-center">
                               <div className="text-center text-sm font-bold text-slate-400 p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl w-full">Settings and profile auto-sync is enabled.</div>
                               {syncStatus && <div className="text-xs text-center font-medium text-emerald-600 bg-emerald-50 py-2 w-full rounded-lg border dark:border-slate-700 border-emerald-100">{syncStatus}</div>}
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
               )}
               {appView === 'admin' && (
                  <AdminPanel onBack={() => setAppView('menu')} />
               )}
               {appView === 'simulation' && (
                  <SimulationEngine 
                     player={player} 
                     track={activeTrack} 
                     weather={weather} 
                     onBack={() => setAppView('menu')} 
                  />
               )}
            </div>
          )}

          {appView === 'calculator' && (
            <React.Fragment>
          {/* TRACK & SETUP TAB */}
          
          {['track_setup', 'strategy'].includes(activeTab) && (
            <div className="mb-6 bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-sm dark:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                     <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                     <h3 className="text-slate-900 dark:text-white font-bold text-lg">{t('Race Preparation Status')}</h3>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {t('Toggle overlay to see missing inputs.')}
                     </p>
                  </div>
               </div>
               <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
                  <button 
                     onClick={() => setLocalSettings(s => ({ ...s, prepFieldsLastUpdated: {} }))}
                     className="p-2 text-xs font-bold rounded-lg transition-colors bg-transparent text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center opacity-70 hover:opacity-100"
                     title={t("Reset Overlay Tracking")}
                  >
                     <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                     onClick={() => setLocalSettings(s => ({...s, isPrepOverlayActive: !s.isPrepOverlayActive}))}
                     className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border flex items-center gap-2 transition-colors ${settings.isPrepOverlayActive ? 'bg-indigo-500 text-white border-indigo-600 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'}`}
                  >
                     {settings.isPrepOverlayActive ? t('Overlay Active') : t('Overlay Off')}
                  </button>
               </div>
            </div>
          )}
          {activeTab === 'home' && (
          <div className="flex flex-col space-y-6 animate-fade-in">
             {timeLeft && (
               <div className="bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-sm dark:shadow-lg rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mx-10 -my-10 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                 <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
                   <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shrink-0">
                     <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                   </div>
                   <div className="min-w-0 pr-4">
                     <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">{t('Next Race')}</p>
                     <p className="font-black text-lg text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{nextRaceName ? t(nextRaceName) : (t('Pending') + '...')}</p>
                   </div>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full sm:w-auto">
                    <button 
                      onClick={() => setLocalSettings(s => ({ ...s, prepFieldsLastUpdated: {} }))}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/40 text-red-600 dark:text-red-100 border border-red-200 dark:border-red-500/50 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" /> {t('Start New Race Prep')}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-mono font-bold text-xl sm:text-2xl">
                      <div className="flex flex-col items-center bg-slate-100 dark:bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-slate-200 dark:border-white/5"><span>{timeLeft.d.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-tighter">{t('Days')}</span></div>
                      <span className="text-slate-500 pb-3">:</span>
                      <div className="flex flex-col items-center bg-slate-100 dark:bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-slate-200 dark:border-white/5"><span>{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-tighter">{t('Hrs')}</span></div>
                      <span className="text-slate-500 pb-3">:</span>
                      <div className="flex flex-col items-center bg-slate-100 dark:bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-slate-200 dark:border-white/5"><span>{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-tighter">{t('Min')}</span></div>
                      <span className="text-slate-500 pb-3">:</span>
                      <div className="flex flex-col items-center bg-slate-100 dark:bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-1.5 rounded-xl w-12 sm:w-16 border border-slate-200 dark:border-white/5"><span>{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-[9px] text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-tighter">{t('Sec')}</span></div>
                    </div>
                 </div>
               </div>
             )}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="rounded-2xl p-6 bg-indigo-600 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Map className="w-24 h-24" /></div>
                <h3 className="text-xl font-bold mb-2">{t('Active Track')}</h3>
                <p className="text-3xl font-black mb-1">{activeTrack.name}</p>
                <p className="text-indigo-100 font-medium">{activeTrack.laps} {t('Laps')} • {activeTrack.distance} km</p>
                <button onClick={() => setActiveTab('track_setup')} className="mt-6 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition backdrop-blur-md">Change Track</button>
             </div>
             
             <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-slate-500 dark:text-slate-100"><User className="w-24 h-24" /></div>
                <h3 className="text-xl font-bold mb-2 text-slate-500 dark:text-slate-400">{t('Active Driver')}</h3>
                <p className="text-3xl font-black mb-1 text-slate-800 dark:text-slate-100">{player.name || 'Driver 1'}</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Aggression: {player.riskAggression} • Exp: {player.driverExperience}</p>
                <button onClick={() => setActiveTab('driver_profile')} className="mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition border border-slate-200 dark:border-slate-700/50">Configure Driver</button>
             </div>
             
             <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2"><Goal className="text-indigo-500 w-5 h-5"/> {t('Top Strategy')}</h3>
                   {results.length > 0 ? (
                      <div>
                         <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{results[0].stops} Stop</p>
                         <p className="text-slate-500 dark:text-slate-400 text-sm">{results[0].stints.map(s => s.tyres).join(' -> ')}</p>
                      </div>
                   ) : <p className="text-red-500 text-sm">No valid strategy found.</p>}
                </div>
                <button onClick={() => setActiveTab('strategy')} className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold transition w-fit">View Strategies</button>
             </div>
             
             <div className="rounded-2xl p-6 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5"/>{t('AI Assistant')}</h3>
                   <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1">{t('Race Analysis & Pre-Race Checklist')}</p>
                   <p className="text-emerald-600/80 dark:text-emerald-500/80 text-xs">{t('Calibration and test lap evaluator.')}</p>
                </div>
                <button onClick={() => setActiveTab('assistant')} className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition w-fit flex items-center gap-2">{t('Open Assistant')} <ChevronRight className="w-4 h-4" /></button>
             </div>
          </div>
          
          {/* DAILY PRO TIP */}
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl shrink-0 mt-1 shadow-sm">
                <Goal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-indigo-950 dark:text-indigo-200 mb-1">{t('Daily GPRO Pro Tip')}</h3>
                <p className="text-indigo-800/80 dark:text-indigo-300/80 text-sm leading-relaxed">{[
                   t("High Chassis, Suspensions, and Underbody reduce tire wear, which can save you a pit stop."),
                   t("Fuel weight penalty is around 0.03s per liter. Adding too much extra fuel will slow you down significantly."),
                   t("When temperatures exceed 25°C, tyre wear increases rapidly. Harder compounds become much more favorable."),
                   t("If a component's wear exceeds 90% during the race, the DNF risk skyrockets. Always keep an eye on parts wear!"),
                   t("Aggressive driving style improves lap times but increases fuel consumption and part wear. Find the perfect balance.")
                ][new Date().getDay() % 5]}</p>
              </div>
            </div>
          </div>

          </div>
        )}
        
        {['track_setup', 'strategy'].includes(activeTab) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 max-lg:data-[landscape=true]:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: TRACK & WEATHER */}
              <div className="space-y-6">
                <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
                      <MapIcon className="w-5 h-5 text-indigo-500" /> Track & Conditions
                    </h2>
                    <div className="flex items-center gap-2 sm:self-auto self-end">
                       <button onClick={() => guessCurrentTrack(false)} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm">
                          🌐 {t('Fetch F1 Calendar')}
                       </button>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 relative w-max pr-3">{t('Track Selection')} <PrepDot fieldKey="track" active={settings.isPrepOverlayActive} settings={settings} /></label>
                      <select 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-700 dark:text-slate-300 font-medium"
                        value={selectedTrackId}
                        onChange={e => setSelectedTrackId(e.target.value)}
                      >
                        {TRACK_DATABASE.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedTrackId === 'custom' && (
                      <div className="grid grid-cols-2 gap-4 p-5 bg-blue-50/50 dark:bg-slate-800/30 rounded-xl border dark:border-slate-700/50 border-blue-100">
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">Laps <Tooltip content="Total number of laps."/></label>
                          <NumberInput value={customTrack.laps} onChange={val => setCustomTrack({...customTrack, laps: val})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg sm:text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Wear Severity</label>
                          <select value={customTrack.wearSeverity} onChange={e => setCustomTrack({...customTrack, wearSeverity: e.target.value as any})} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none">
                            {Object.keys(SEVERITY_MULTIPLIERS).map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Fuel Burn</label>
                          <select value={customTrack.fuelSeverity} onChange={e => setCustomTrack({...customTrack, fuelSeverity: e.target.value as any})} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none">
                            {Object.keys(SEVERITY_MULTIPLIERS).map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">Base Pit Time (s) <Tooltip content="Time lost in pitlane without refuelling (usually 20-24s)."/></label>
                          <NumberInput value={customTrack.pitTimeBase} onChange={val => setCustomTrack({...customTrack, pitTimeBase: val})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg sm:text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-400" /> Weather
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-700/50 border-slate-200 shadow-sm flex flex-col items-center">
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 text-center uppercase tracking-wider relative w-max pr-3">Min (°C)<PrepDot fieldKey="weather" active={settings.isPrepOverlayActive} settings={settings} /></label>
                          <div className="flex items-center justify-center w-full gap-3 mt-1">
                             <button onClick={() => setWeather({...weather, tempBase: weather.tempBase - 1})} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 transition font-bold" title="-1°C">-</button>
                             <NumberInput value={weather.tempBase} onChange={val => setWeather({...weather, tempBase: val})} onConfirm={() => markFieldUpdated('weather')} className="w-16 text-center bg-transparent dark:text-slate-100 text-2xl font-mono font-black text-slate-700 dark:text-slate-200 focus:outline-none" />
                             <button onClick={() => setWeather({...weather, tempBase: weather.tempBase + 1})} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 transition font-bold" title="+1°C">+</button>
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-700/50 border-slate-200 shadow-sm flex flex-col items-center">
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 text-center uppercase tracking-wider relative w-max pr-3">Max (°C)<PrepDot fieldKey="weather" active={settings.isPrepOverlayActive} settings={settings} /></label>
                          <div className="flex items-center justify-center w-full gap-3 mt-1">
                             <button onClick={() => setWeather({...weather, tempMax: weather.tempMax - 1})} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 transition font-bold" title="-1°C">-</button>
                             <NumberInput value={weather.tempMax} onChange={val => setWeather({...weather, tempMax: val})} onConfirm={() => markFieldUpdated('weather')} className="w-16 text-center bg-transparent dark:text-slate-100 text-2xl font-mono font-black text-slate-700 dark:text-slate-200 focus:outline-none" />
                             <button onClick={() => setWeather({...weather, tempMax: weather.tempMax + 1})} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 transition font-bold" title="+1°C">+</button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                          <CloudRain className="w-4 h-4 text-blue-500" /> {t('Rain Probabilities')} (%)
                          <Tooltip content={t("Configure qualifying and race rain probabilities.")} />
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border dark:border-slate-700/50 border-slate-200">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 text-center mb-1.5">Q1</label>
                            <NumberInput min={0} max={100} value={weather.rainProps.q1} onChange={val => setWeather({...weather, rainProps: {...weather.rainProps, q1: val}})} onConfirm={() => markFieldUpdated('weather')} className="w-full text-center bg-transparent dark:text-slate-100 text-sm font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none" />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border dark:border-slate-700/50 border-slate-200">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 text-center mb-1.5 break-words">Q2 & 0-30</label>
                            <NumberInput min={0} max={100} value={weather.rainProps.q2_r1} onChange={val => setWeather({...weather, rainProps: {...weather.rainProps, q2_r1: val}})} onConfirm={() => markFieldUpdated('weather')} className="w-full text-center bg-transparent dark:text-slate-100 text-sm font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none" />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border dark:border-slate-700/50 border-slate-200">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 text-center mb-1.5 break-words">30-60 dk</label>
                            <NumberInput min={0} max={100} value={weather.rainProps.r2} onChange={val => setWeather({...weather, rainProps: {...weather.rainProps, r2: val}})} onConfirm={() => markFieldUpdated('weather')} className="w-full text-center bg-transparent dark:text-slate-100 text-sm font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none" />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border dark:border-slate-700/50 border-slate-200">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 text-center mb-1.5 break-words">1-1.5 sa</label>
                            <NumberInput min={0} max={100} value={weather.rainProps.r3} onChange={val => setWeather({...weather, rainProps: {...weather.rainProps, r3: val}})} onConfirm={() => markFieldUpdated('weather')} className="w-full text-center bg-transparent dark:text-slate-100 text-sm font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none" />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border dark:border-slate-700/50 border-slate-200">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 text-center mb-1.5 break-words">1.5-2 sa</label>
                            <NumberInput min={0} max={100} value={weather.rainProps.r4} onChange={val => setWeather({...weather, rainProps: {...weather.rainProps, r4: val}})} onConfirm={() => markFieldUpdated('weather')} className="w-full text-center bg-transparent dark:text-slate-100 text-sm font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: SETUP TOOL */}
              <div className="space-y-6">
                <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 p-6 rounded-2xl shadow-sm border dark:border-slate-700 border-blue-100">
                  <div className="flex items-center gap-3 mb-6 border-b dark:border-slate-700 border-blue-100 pb-4">
                    <div className="bg-blue-500 p-2 rounded-xl text-white shadow-sm">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">{t("Smart Setup Assistant")}</h2>
                        <Tooltip content={t("These suggestions are specifically estimated based on the track characteristics and air temperature.")} />
                      </div>
                      <p className="text-xs text-blue-600 font-medium">{t("Dynamic recommendations based on active track and weather")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative">
                      <div className="absolute top-2 right-2"><Tooltip content="High wings for corner-heavy tracks, low wings for straights." /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("Wings (FW/RW)")}</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-200">Med-High</span>
                      <span className="text-[10px] text-slate-400 mt-1">{t("Increase downforce in high temperature")}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative">
                      <div className="absolute top-2 right-2"><Tooltip content="Gear ratios determine acceleration (short) or top speed (long)." /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gearbox</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-200">{t("Medium")}</span>
                      <span className="text-[10px] text-slate-400 mt-1">{t("Acceleration focus")} ({activeTrack.name})</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative">
                      <div className="absolute top-2 right-2"><Tooltip content="Engine cooling. Must be high in hot temperatures to avoid failure." /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("Engine")}</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-200">Cooling+</span>
                      <span className="text-[10px] text-slate-400 mt-1">{(weather.tempMax > 25) ? "Max temp is high, careful with engine" : "Normal revs"}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative">
                      <div className="absolute top-2 right-2"><Tooltip content="Chassis stiffness and curb use. Directly linked to driver skills." /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("Suspension")}</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-200">{t("Hard")}</span>
                      <span className="text-[10px] text-slate-400 mt-1">{t("Corner balance focus")}</span>
                    </div>
                  </div>

                  <div className="mt-5 p-4 bg-blue-100/50 rounded-xl text-sm text-blue-900 border dark:border-slate-700 border-blue-200 border-dashed flex items-start gap-3">
                    <Info className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
                    <p>
                      <strong>{t("Setup Note:")}</strong> Calculations automatically adapt using the temperature <span className="font-mono bg-blue-200 px-1 rounded">{((weather.tempBase+weather.tempMax)/2).toFixed(1)}°C</span> and <span className="font-mono bg-blue-200 px-1 rounded">{activeTrack.name}</span> data and adapts accordingly. Driver skills affect suspension travel.
                    </p>
                  </div>
                </section>

              </div>

            </div>
          )}

          {['driver_profile', 'economy'].includes(activeTab) && (
             <div className="grid grid-cols-1 lg:grid-cols-2 max-lg:data-[landscape=true]:grid-cols-2 gap-8">
               <div className="space-y-6">
                 {/* PLAYER & CAR STATS */}
                  <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
                          <User className="w-5 h-5 text-indigo-500" /> {t('Driver & Parts')}
                          <Tooltip content={t('Driver skills and chassis impact base wear.')} />
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isSyncing && <span className="text-xs text-indigo-500 font-medium mr-2">{syncStatus}</span>}
                        <button onClick={exportProfileToClipboard} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm" title={t("Copy Profile ID ID to Clipboard")}><User className="w-3.5 h-3.5"/> Copy ID</button>
                        <button onClick={importProfileFromClipboard} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm" title={t("Load Profile ID from Clipboard")}><User className="w-3.5 h-3.5"/> Load ID</button>
                        <button onClick={exportProfileToFile} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm" title={t("Save Profile as JSON File")}>⬇️ Save</button>
                        <button onClick={importProfileFromFile} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm" title={t("Load Profile from JSON File")}>⬆️ Load</button>
                        <button onClick={fetchGproApi} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 dark:border-indigo-800/30 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm"><MonitorSmartphone className="w-3.5 h-3.5" /> API Sync</button>
                        <button onClick={loadDriverFromCloud} className="px-3 py-1.5 bg-blue-50 border border-blue-200 dark:border-blue-800/30 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm"><CloudCog className="w-3.5 h-3.5" /> Load Cloud</button>
                        <button onClick={saveDriverToCloud} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 dark:border-emerald-800/30 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm"><Save className="w-3.5 h-3.5" /> Save Cloud</button>
                        <button onClick={resetPlayerSettings} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-400 transition flex items-center justify-center text-[10px] font-bold uppercase tracking-widest"><RotateCcw className="w-4 h-4"/><Tooltip content="Reset values to default."/></button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            {t('Tyre Supplier')} <Tooltip content="Different brands have different wear rates." />
                          </label>
                          <button onClick={() => setPlayer({...player, tyreSupplier: 'Pipirelli'})} className="text-slate-400 hover:text-indigo-500 transition border dark:border-slate-700 bg-white dark:bg-slate-800 p-1 rounded shadow-sm"><RotateCcw className="w-3.5 h-3.5" /></button>
                        </div>
                        <select onBlur={() => markFieldUpdated('tyreSupplier')} value={player.tyreSupplier} onChange={e => setPlayer({...player, tyreSupplier: e.target.value})} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none">
                           <option value="Pipirelli">Pipirelli ({t("Fast / Very High Wear")})</option>
                           <option value="Avonn">Avonn ({t("Extreme Wear")})</option>
                           <option value="Contimental">Contimental ({t("Balanced")})</option>
                           <option value="Dunnolop">Dunnolop ({t("Durable")})</option>
                           <option value="Yokohama">Yokohama ({t("Highly Durable")})</option>
                           <option value="Michelin">Michelin ({t("Extremely Durable")})</option>
                           <option value="Bridgestone">Bridgestone ({t("Good")})</option>
                           <option value="Hancock">Hancock ({t("Bad")})</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                             {t('Base Fuel Burn')} <Tooltip content="Standard fuel burn per lap. (3.0 L/t is default)." />
                          </label>
                          <div className="flex items-center gap-3">
                             <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{player.baseFuelPerLap} L/t</span>
                             <button onClick={() => setPlayer({...player, baseFuelPerLap: 3.0})} className="text-slate-400 hover:text-indigo-500 transition border dark:border-slate-700 bg-white dark:bg-slate-800 p-1 rounded shadow-sm"><RotateCcw className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <input type="range" onMouseUp={() => markFieldUpdated('baseFuelPerLap')} min="1.5" max="5.0" step="0.1" value={player.baseFuelPerLap} onChange={e => setPlayer({...player, baseFuelPerLap: Number(e.target.value)})} className="w-full accent-indigo-500" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            {t('Tyre Wear Multiplier')} <span className="relative w-max pl-2"><PrepDot fieldKey="driverWearMultiplier" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="Hidden risk multiplier added to wear calculations." />
                          </label>
                          <div className="flex items-center gap-3">
                             <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">x{player.baseWearMultiplier.toFixed(2)}</span>
                             <button onClick={() => setPlayer({...player, baseWearMultiplier: 1.0})} className="text-slate-400 hover:text-indigo-500 transition border dark:border-slate-700 bg-white dark:bg-slate-800 p-1 rounded shadow-sm"><RotateCcw className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <input type="range" min="0.5" max="1.5" step="0.05" value={player.baseWearMultiplier} onChange={e => setPlayer({...player, baseWearMultiplier: Number(e.target.value)})} className="w-full accent-indigo-500" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            {t('Driver Aggression')} <span className="relative w-max pl-2"><PrepDot fieldKey="riskAggression" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="Driver's standard in-race aggression (20 is default)." />
                          </label>
                          <div className="flex items-center gap-3">
                             <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{player.riskAggression}</span>
                             <button onClick={() => setPlayer({...player, riskAggression: 20})} className="text-slate-400 hover:text-indigo-500 transition border dark:border-slate-700 bg-white dark:bg-slate-800 p-1 rounded shadow-sm"><RotateCcw className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <input type="range" min="0" max="100" step="1" value={player.riskAggression} onChange={e => setPlayer({...player, riskAggression: Number(e.target.value)})} className="w-full accent-indigo-500 mb-2" />
                        <div className="flex gap-2">
                           <button onClick={() => setPlayer({...player, riskAggression: 5, baseWearMultiplier: 0.95})} className="flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap overflow-hidden text-ellipsis px-1">{t("Safe")}</button>
                           <button onClick={() => setPlayer({...player, riskAggression: 35, baseWearMultiplier: 1.05})} className="flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 hover:bg-indigo-100 transition whitespace-nowrap overflow-hidden text-ellipsis px-1">{t("Balanced")}</button>
                           <button onClick={() => setPlayer({...player, riskAggression: 80, baseWearMultiplier: 1.25})} className="flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:border-red-800 hover:bg-red-100 transition whitespace-nowrap overflow-hidden text-ellipsis px-1">{t("Aggressive")}</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-5 border-slate-100 dark:border-slate-800 mt-2">
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">{t("Risk Distribution")} <Tooltip content="Set specific risks for the engine. Determines pace and mistake chance." /></label>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {['clear', 'defend', 'overtake', 'malfunction'].map(k => (
                                <div key={k}>
                                  <div className="flex justify-between items-center text-xs mb-1 text-slate-500 dark:text-slate-400">
                                    <span className="relative w-max pr-3 capitalize">{t(k)}<PrepDot fieldKey="risks" active={settings.isPrepOverlayActive} settings={settings} /></span>
                                    <span className="font-mono text-indigo-500 font-bold">{player.risks?.[k as keyof typeof player.risks] || 0}</span>
                                  </div>
                                  <input type="range" min="0" max="100" value={player.risks?.[k as keyof typeof player.risks] || 0} onChange={e => {
                                      const newRisks = { ...(player.risks || { clear:0, defend:0, overtake:0, malfunction:0 }), [k]: Number(e.target.value) };
                                      setPlayer({ ...player, risks: newRisks });
                                  }} className="w-full accent-indigo-500" />
                                </div>
                              ))}
                          </div>
                        </div>

                         <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                {t("Focus")} <span className="relative w-max pl-2"><PrepDot fieldKey="driverFocus" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="Default: 100" />
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{player.driverFocus}</span>
                                <button onClick={() => setPlayer({...player, driverFocus: 100})} className="text-slate-400 hover:text-indigo-500 transition"><RotateCcw className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            <input type="range" onMouseUp={() => markFieldUpdated('driverFocus')} min="0" max="250" value={player.driverFocus} onChange={e => setPlayer({...player, driverFocus: Number(e.target.value)})} className="w-full accent-indigo-500" />
                         </div>
                         <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                {t("Stamina")} <span className="relative w-max pl-2"><PrepDot fieldKey="driverStamina" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="Default: 100" />
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{player.driverStamina}</span>
                                <button onClick={() => setPlayer({...player, driverStamina: 100})} className="text-slate-400 hover:text-indigo-500 transition"><RotateCcw className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            <input type="range" onMouseUp={() => markFieldUpdated('driverStamina')} min="0" max="250" value={player.driverStamina} onChange={e => setPlayer({...player, driverStamina: Number(e.target.value)})} className="w-full accent-indigo-500" />
                         </div>
                         <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                {t("Experience")} <span className="relative w-max pl-2"><PrepDot fieldKey="driverExperience" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="Default: 50" />
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{player.driverExperience}</span>
                                <button onClick={() => setPlayer({...player, driverExperience: 50})} className="text-slate-400 hover:text-indigo-500 transition"><RotateCcw className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            <input type="range" onMouseUp={() => markFieldUpdated('driverExperience')} min="0" max="250" value={player.driverExperience} onChange={e => setPlayer({...player, driverExperience: Number(e.target.value)})} className="w-full accent-indigo-500" />
                         </div>
                         <div className="flex flex-col justify-end">
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{t("Driver Presets")}</label>
                            <div className="flex gap-1 h-[36px]">
                               <button onClick={() => setPlayer({...player, driverFocus: 50, driverStamina: 50, driverExperience: 20})} className="flex-1 bg-slate-100 dark:bg-slate-800 text-[10px] whitespace-nowrap overflow-hidden font-bold rounded text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition" title="Rookie Driver">Rook</button>
                               <button onClick={() => setPlayer({...player, driverFocus: 140, driverStamina: 120, driverExperience: 80})} className="flex-1 bg-slate-100 dark:bg-slate-800 text-[10px] whitespace-nowrap overflow-hidden font-bold rounded text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition" title="Veteran Driver">Vet</button>
                               <button onClick={() => setPlayer({...player, driverFocus: 250, driverStamina: 250, driverExperience: 250})} className="flex-1 bg-slate-100 dark:bg-slate-800 text-[10px] whitespace-nowrap overflow-hidden font-bold rounded text-slate-600 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition" title="Maxed Driver">Max</button>
                            </div>
                         </div>
                         <div>
                            <div className="flex items-center justify-between mb-1.5">
                               <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">{t("League")} <span className="relative w-max pl-2"><PrepDot fieldKey="league" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="League you play in." /></label>
                            </div>
                            <select value={player.league || "Rookie"} onChange={e => setPlayer({...player, league: e.target.value as any})} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none">
                               <option value="Rookie">Rookie</option>
                               <option value="Amateur">Amateur</option>
                               <option value="Pro">Pro</option>
                               <option value="Master">Master</option>
                               <option value="Elite">Elite</option>
                            </select>
                         </div>
                         <div>
                            <div className="flex items-center justify-between mb-1.5">
                               <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">{t("Starting Grid")} <span className="relative w-max pl-2"><PrepDot fieldKey="startPosition" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="Penalizes pit stops more if you start at the front." /></label>
                            </div>
                            <NumberInput min={1} max={player.totalRacers || 40} value={player.startPosition || 1} onChange={val => setPlayer({...player, startPosition: val})} onConfirm={() => markFieldUpdated('startPosition')} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg sm:text-sm focus:ring-1 focus:ring-indigo-500" />
                         </div>
                         <div>
                            <div className="flex items-center justify-between mb-1.5">
                               <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">{t("Total Racers")} <span className="relative w-max pl-2"><PrepDot fieldKey="totalRacers" active={settings.isPrepOverlayActive} settings={settings} /></span><Tooltip content="Number of drivers in the grid." /></label>
                            </div>
                            <NumberInput min={1} max={40} value={player.totalRacers || 40} onChange={val => setPlayer({...player, totalRacers: val})} onConfirm={() => markFieldUpdated('totalRacers')} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg sm:text-sm focus:ring-1 focus:ring-indigo-500" />
                         </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
                          <Wrench className="w-5 h-5 text-indigo-500" /> {t('Car Character (Quick Setup)')}
                        </h2>
                     </div>
                     <p className="text-xs text-slate-500 mb-4">{t("Enter your current car character (Power, Handling, Acceleration). This is faster than entering all 11 parts and improves calculation stability.")}</p>
                     <div className="grid grid-cols-3 gap-3">
                        {['power', 'handling', 'acceleration'].map(part => (
                           <div key={part}>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 capitalize relative w-max pr-3">{t(part)}<PrepDot fieldKey="carPHA" active={settings.isPrepOverlayActive} settings={settings} /></label>
                              <NumberInput 
                                 min={0} max={250} 
                                 value={player.pha?.[part as keyof typeof player.pha] || 0} 
                                 onChange={val => setPlayer({...player, pha: {...(player.pha || {power:0, handling:0, acceleration:0}), [part]: val}})}
                                 className="w-full p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg text-sm text-center focus:ring-1 focus:ring-indigo-500" 
                              />
                           </div>
                        ))}
                     </div>
                  </section>

                  {/* ADVANCED MODIFIERS */}
                  <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
                        <Settings className="w-5 h-5 text-indigo-500" /> {t('Advanced Constants')}
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center relative w-max pr-3">{t('Driver Weight (kg)')}<PrepDot fieldKey="driverWeight" active={settings.isPrepOverlayActive} settings={settings} /></label>
                         <NumberInput value={constants.driverWeight} onChange={val => setConstants({...constants, driverWeight: val})} onConfirm={() => markFieldUpdated('driverWeight')} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-lg" />
                         <p className="text-[10px] text-slate-400 mt-1">{t("Calculated penalty per liter:")} {(constants.driverWeight * 0.00045).toFixed(3)}s/L</p>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center relative w-max pr-3">{t("Refuel Rate (L/s)")}<PrepDot fieldKey="pitRefuelRate" active={settings.isPrepOverlayActive} settings={settings} /></label>
                         <NumberInput value={constants.pitRefuelRate} onChange={val => setConstants({...constants, pitRefuelRate: val})} onConfirm={() => markFieldUpdated('pitRefuelRate')} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-lg" />
                      </div>
                    </div>
                  </section>
               </div>
               
               <div className="space-y-6">
                 {/* Track Analysis rendered next to Driver specific metrics */}
                 <TrackAnalysisView params={calcParams} />
               </div>
             </div>
          )}

          {/* STRATEGY TAB */}
          {['track_setup', 'strategy'].includes(activeTab) && (
            <div className="flex flex-col gap-6">
                {/* DASHBOARD TOP STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 max-lg:data-[landscape=true]:grid-cols-3 gap-4">
                  <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 opacity-80 mb-2">
                      <Siren className="w-5 h-5" />
                      <span className="text-sm font-medium">{t("Active Track")}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold tracking-tight">{activeTrack.name}</p>
                      <p className="text-blue-100 text-sm mt-1">{activeTrack.laps} Tur • {activeTrack.distance} km</p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                      <Fuel className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium">{t("Fuel per Lap")}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-200">{estFuelPerLap.toFixed(2)} L</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">({activeTrack.fuelSeverity} karakteristik)</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">{t("Pit Stop Parameter")}</span>
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 text-lg font-medium">{t("Base:")} {activeTrack.pitTimeBase} {t("sec")}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">+{constants.pitRefuelRate} L/sn Added to refuel duration</p>
                    </div>
                  </div>
                </div>

                {/* SMALL WEATHER BAR */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 shadow-sm text-sm">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                            🌤️
                         </div>
                         <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("Temperature")}</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{weather.tempBase}°C - {weather.tempMax}°C</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                            💧
                         </div>
                         <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("Humidity")}</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{weather.humidity || 50}%</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("Precipitation Prob")}:</div>
                      <div className="flex bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 overflow-hidden text-[10px] font-mono font-bold">
                         <div className="px-1.5 border-r border-slate-100 dark:border-slate-800 py-1" title="Q1">Q1: {weather.rainProps?.q1}%</div>
                         <div className="px-1.5 border-r border-slate-100 dark:border-slate-800 py-1" title="Q2/R1">R1: {weather.rainProps?.q2_r1}%</div>
                         <div className="px-1.5 border-r border-slate-100 dark:border-slate-800 py-1" title="R2">R2: {weather.rainProps?.r2}%</div>
                         <div className="px-1.5 border-r border-slate-100 dark:border-slate-800 py-1" title="R3">R3: {weather.rainProps?.r3}%</div>
                         <div className="px-1.5 py-1" title="R4">R4: {weather.rainProps?.r4}%</div>
                      </div>
                   </div>
                </div>

                {/* MAIN RESULTS AREA */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/80 p-6 xl:p-8 flex-1">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3 border-b dark:border-slate-700 pb-4">
                    <BarChart3 className="w-6 h-6 text-emerald-500" /> Optimum Strateji Analizi
                  </h2>

                  {results.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      No valid strategy found. Tyres might be overheating or wearing too fast. Try softening the temp/wear conditions.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* SELECTED STRATEGY HIGHLIGHT */}
                      <AnimatePresence mode="wait">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        transition={{ duration: 0.3 }}
                        key={selectedStratIndex} 
                        className={`border dark:border-slate-700 rounded-xl p-6 transition-all ${selectedStratIndex === 0 ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100' : 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-100'}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                               <h3 className={`text-lg font-bold ${selectedStratIndex === 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-indigo-900 dark:text-indigo-300'}`}>{t("Selected Strategy:")} {selectedStrategy!.stops} Pit Stop</h3>
                               {manualStintLaps && baseSelectedStrategy && (JSON.stringify(manualStintLaps) !== JSON.stringify(baseSelectedStrategy.stints.map(s => s.laps))) && (
                                   <button 
                                      onClick={() => setManualStintLaps(baseSelectedStrategy.stints.map(s => s.laps))}
                                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${selectedStratIndex === 0 ? 'text-emerald-600 border-emerald-300 hover:bg-emerald-100' : 'text-indigo-600 border-indigo-300 hover:bg-indigo-100'} transition`}
                                   >
                                      Reset
                                   </button>
                               )}
                            </div>
                            <p className={`${selectedStratIndex === 0 ? 'text-emerald-600' : 'text-indigo-600'} text-sm mt-1`}>{t("Relative Time Cost:")} <span className="font-mono">+{selectedStrategy!.totalRaceTime.toFixed(1)} {t("sec")}</span></p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={handleCopyProtocol} className="p-2 bg-white/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition" title={t("Copy Summary")}>
                               <Copy className="w-4 h-4"/>
                            </button>
                            <button onClick={handleDownloadProtocol} className="p-2 bg-white/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition" title={t("Download Summary")}>
                               <Download className="w-4 h-4"/>
                            </button>
                            {selectedStratIndex === 0 ? (
                              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-semibold border dark:border-slate-700 border-emerald-200">{t("Fastest (Recommended)")}</div>
                            ) : (
                              <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-semibold border dark:border-slate-700 border-indigo-200">{t("Inspecting")}</div>
                            )}
                            {selectedStrategy!._isManualValid !== true && selectedStrategy!._isManualValid !== undefined && (
                               <div className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-full text-sm font-semibold border border-red-200 ml-2 animate-pulse">{t(selectedStrategy!._isManualValid as string)}</div>
                            )}
                          </div>
                        </div>

                        {selectedStrategy!.stints.some(s => s.wearEnd > 90) && (
                           <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-5 flex items-center gap-2 text-sm font-bold">
                              <Siren className="w-5 h-5"/>
                              {t("EXTREME DNF RISK: Wait! One or more stints exceed 90% wear. Reduce laps to prevent parts wear-out.")}
                           </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                          {selectedStrategy!.stints.map((stint, idx) => (
                            <div key={idx} className={`bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border shadow-sm flex flex-col justify-between ${selectedStratIndex === 0 ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-indigo-100 dark:border-indigo-900/30'} ${stint.wearEnd > 95 ? 'border-red-300 dark:border-red-800' : ''}`}>
                              <div className={`text-xs font-bold uppercase mb-3 border-b dark:border-slate-700 pb-2 flex justify-between items-center ${selectedStratIndex === 0 ? 'text-emerald-600 border-emerald-50' : 'text-indigo-600 border-indigo-50'}`}>
                                <span>{t("Stint")} {idx + 1}</span>
                                <span className="font-mono opacity-50 px-1 bg-slate-50 dark:bg-slate-900 rounded">#{idx + 1}</span>
                              </div>
                              <div className="font-mono text-xl font-black text-slate-800 dark:text-slate-200 mb-3 mt-1 flex items-center justify-between">
                                <div><span className="text-slate-400 font-medium text-lg mr-1 ml-0.5">| </span>{COMPOUND_FULL_NAMES[stint.tyres]}</div>
                                {stint.conditionsPenalty !== undefined && stint.conditionsPenalty > 0 && (
                                   <div className="-mt-1 px-1 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[10px] uppercase font-sans antialiased tracking-wide rounded flex items-center gap-1 cursor-help">
                                      <AlertTriangle className="w-3 h-3" /> Cost
                                      <Tooltip content={`Time penalty due to weather: +${stint.conditionsPenalty.toFixed(1)}s`} />
                                   </div>
                                )}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                                <div className="mb-2">
                                  <p className="flex justify-between items-center mb-1">{t("Distance:")} <strong className={stint.wearEnd > 95 ? "text-red-500" : "text-slate-800 dark:text-slate-200"}>{stint.laps} v</strong></p>
                                  {manualStintLaps && manualStintLaps.length > 1 && idx < manualStintLaps.length - 1 && (
                                     <input 
                                        type="range" 
                                        min="1" 
                                        max={manualStintLaps[idx] + manualStintLaps[idx+1] - 1} 
                                        value={manualStintLaps[idx]} 
                                        onChange={(e) => {
                                            const newVal = parseInt(e.target.value, 10);
                                            const diff = newVal - manualStintLaps[idx];
                                            const newLaps = [...manualStintLaps];
                                            newLaps[idx] = newVal;
                                            newLaps[idx+1] -= diff;
                                            setManualStintLaps(newLaps);
                                        }}
                                        className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" 
                                     />
                                  )}
                                </div>
                                <p className="flex justify-between items-center text-xs">{t("Wear:")} <strong className={`${stint.wearEnd > 95 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{stint.wearEnd.toFixed(1)}%</strong></p>
                                <p className="flex justify-between items-center text-xs">{t("Fuel:")} <strong className="text-slate-800 dark:text-slate-200">{Math.ceil(stint.fuelStart)} L</strong></p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* THEORETICAL ANALYSIS ADDITION */}
                        <div className="mt-4 bg-indigo-50/50 p-3.5 rounded-xl border dark:border-slate-700 border-indigo-100 mb-4 group transition-all duration-300 hover:shadow-sm hover:border-indigo-200">
                            <div className="flex items-start gap-3">
                               <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-700 border-indigo-100 shadow-sm shrink-0">
                                  <Info className="w-5 h-5 text-indigo-500" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <h4 className="text-sm font-bold text-indigo-900 mb-1">{t("Strategy Engine Recommendation")}</h4>
                                     <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-[2px] rounded text-[9px] font-bold uppercase tracking-wider mb-1">{t("AI Insight")}</span>
                                  </div>
                                  <p className="text-xs text-indigo-800/80 leading-relaxed">
                                      {t("In this")} {selectedStrategy!.stints.length - 1}-{t("stop strategy, the predominant compound is")} <strong className="text-indigo-900">{COMPOUND_FULL_NAMES[selectedStrategy!.stints[0].tyres]}</strong>. 
                                      {weather.tempMax > 25 ? ` ${t("Hot weather")} (${weather.tempMax}°C) ${t("demands careful tyre management. Lower your aggression by")} ~${Math.min(20, Math.floor((weather.tempMax - 25) * 2))} ${t("points to avoid overheating.")}` : ` ${t("Temperatures are optimal")} (${weather.tempMax}°C), ${t("aggressive strategies can be executed safely.")}`}
                                      {player.riskAggression > 60 ? ` ${t("Your high risk factor")} (${player.riskAggression}) ${t("brings short term pace (est.")} -0.${Math.floor(player.riskAggression/10)}s ${t("per lap) but beware of unexpected tyre loss.")}` : ` ${t("Balanced driving")} (${player.riskAggression}) ${t("allows optimal tyre degradation, saving ~1 pit stop over hyper-aggressive drivers.")}`}
                                      {selectedStrategy!.stints[0].laps > 30 && ` ${t("The long first stint of")} ${selectedStrategy!.stints[0].laps} ${t("laps means you will start with heavy fuel. Expect a pace deficit of")} ~1.2s ${t("in the first 5 laps compared to lighter cars.")}`}
                                  </p>
                               </div>
                            </div>
                        </div>

                        
                        {/* CHART VISUAL */}
                        <div className="mt-8">
                          <div className="flex items-center gap-2 mb-2 ml-1">
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Tyre Degradation Curve')}</div>
                             <Tooltip content="Tyre life remaining over laps." />
                          </div>
                          <motion.div 
                            key={`wear-${selectedStratIndex}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 h-56"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={wearGraphData} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                                <defs>
                                  <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="lap" type="number" domain={[0, 'dataMax']} style={{fontSize: '10px'}} stroke={isDark ? '#64748b' : '#94a3b8'} />
                                <YAxis domain={[0, 100]} style={{fontSize: '10px'}} stroke={isDark ? '#64748b' : '#94a3b8'} />
                                <RechartsTooltip 
                                  contentStyle={{backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'), boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'}}
                                  itemStyle={{color: '#6366f1', fontSize: '13px', fontWeight: '800'}}
                                  labelStyle={{color: isDark ? '#cbd5e1' : '#475569', fontSize: '11px', marginBottom: '4px', fontWeight: '600'}}
                                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Remaining Life']}
                                  labelFormatter={(label) => `Lap ${label}`}
                                />
                                <Area 
                                  connectNulls={false} 
                                  type="monotone" 
                                  dataKey="remaining" 
                                  stroke="#6366f1" 
                                  fillOpacity={1}
                                  fill="url(#colorWear)"
                                  strokeWidth={3}
                                  animationDuration={1500}
                                  dot={false} 
                                  activeDot={{r: 6, strokeWidth: 0, fill: '#4f46e5'}} 
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </motion.div>
                        </div>

                        
                        {/* FUEL CURVE */}
                        <div className="mt-8">
                          <div className="flex items-center gap-2 mb-1.5 ml-1">
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Fuel Load Curve (Liters)')}</div>
                             <Tooltip content="Fuel amount in tank over laps." />
                          </div>
                          <motion.div 
                            key={`fuel-${selectedStratIndex}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 h-56"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={fuelGraphData} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                                <defs>
                                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="lap" type="number" domain={[0, 'dataMax']} style={{fontSize: '10px'}} stroke={isDark ? '#64748b' : '#94a3b8'} />
                                <YAxis domain={[0, 'dataMax']} style={{fontSize: '10px'}} stroke={isDark ? '#64748b' : '#94a3b8'} />
                                <RechartsTooltip 
                                  contentStyle={{backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'), boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'}}
                                  itemStyle={{color: '#f97316', fontSize: '13px', fontWeight: '800'}}
                                  labelStyle={{color: isDark ? '#cbd5e1' : '#475569', fontSize: '11px', marginBottom: '4px', fontWeight: '600'}}
                                  formatter={(value: any) => [`${Number(value).toFixed(1)} L`, 'Fuel Remaining']}
                                  labelFormatter={(label) => `Lap ${label}`}
                                />
                                 <Area 
                                  connectNulls={false} 
                                  type="monotone" 
                                  dataKey="remaining" 
                                  stroke="#f97316" 
                                  fillOpacity={1}
                                  fill="url(#colorFuel)"
                                  strokeWidth={3}
                                  animationDuration={1500}
                                  dot={false} 
                                  activeDot={{r: 6, strokeWidth: 0, fill: '#ea580c'}} 
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </motion.div>
                        </div>

                        {/* STINT VISIBILITY TOGGLES */}
                        <div className="md:col-span-2 flex flex-wrap items-center gap-3 mt-2 px-2">
                           <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">{t('Visible Stints')}:</span>
                           {selectedStrategy!.stints.map((stint, idx) => (
                              <label key={idx} className="flex items-center gap-2 cursor-pointer select-none group">
                                 <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${!hiddenStints.includes(idx) ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-slate-300 dark:border-slate-600 dark:group-hover:border-slate-400'}`}>
                                    {!hiddenStints.includes(idx) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={!hiddenStints.includes(idx)} 
                                    onChange={(e) => {
                                       if (e.target.checked) setHiddenStints(h => h.filter(id => id !== idx));
                                       else setHiddenStints(h => [...h, idx]);
                                    }} 
                                 />
                                 <span className={`text-sm font-medium transition ${!hiddenStints.includes(idx) ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                    Stint {idx + 1}
                                 </span>
                              </label>
                           ))}
                        </div>

                        {/* VISUAL STINT BAR */}

                        <div className="mt-5">
                          <div className="flex items-center gap-2 mb-1.5 ml-1">
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Lap Distribution Chart')}</div>
                             <Tooltip content="Visualizes the percentage length of each stint in the strategy. Hover for details." />
                          </div>
                          <div className="flex w-full h-8 gap-2 overflow-visible bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                            {selectedStrategy?.stints.map((stint, idx) => {
                              const totalStints = selectedStrategy.stints.length;
                              const widthPct = (stint.laps / selectedStrategy.stints.reduce((sum, s) => sum + s.laps, 0)) * 100;
                              return (
                                <div 
                                  key={idx} 
                                  className={`h-full rounded-lg transition-all flex items-center justify-center font-bold text-[10px] overflow-hidden truncate px-1 group cursor-default shadow-sm ${idx % 2 === 0 ? 'bg-indigo-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100'}`}
                                  style={{ width: `${widthPct}%` }}
                                >
                                  <span>{stint.laps}</span>
                                  <div className="absolute opacity-0 group-hover:opacity-100 -mt-14 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-50">
                                    {t('Stint')} {idx + 1}: {stint.laps} {t('laps')}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                      </AnimatePresence>

                      {/* STRATEGY LIST MODIFIED */}
                      <div>
                        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-4 px-1">{t('All Valid Strategies')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          <AnimatePresence>{results.slice(0, 12).map((strat, sIdx) => {
                            const diff = strat.totalRaceTime - bestStrategy!.totalRaceTime;
                            const isSelected = selectedStratIndex === sIdx;
                            const isBest = sIdx === 0;

                            return (
                              <motion.button 
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2, delay: sIdx * 0.05 }}
  key={sIdx} 
  onClick={() => setSelectedStratIndex(sIdx)}
  className={`w-full text-left flex flex-col justify-between p-2.5 rounded-xl transition-colors border ${isSelected ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700 dark:ring-indigo-700' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-sm'}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                                    {strat.stops} Pit
                                    {isBest && <span className="text-[8px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1 py-0.5 rounded uppercase tracking-wider">{t("Best")}</span>}
                                  </div>
                                  <div className={`text-[10px] font-mono font-semibold ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isBest ? 'Ref' : `+${diff.toFixed(1)}s`}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {strat.stints.map((st, idx) => (
                                    <div key={idx} className={`flex items-center text-[10px] ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                                      <span className="font-medium text-slate-600 dark:text-slate-300">{st.laps}v</span> 
                                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 ml-0.5">{COMPOUND_FULL_NAMES[st.tyres].charAt(0)}</span>
                                      {idx < strat.stints.length - 1 && <span className="text-slate-300 dark:text-slate-600 ml-1">-</span>}
                                    </div>
                                  ))}
                                </div>
                              </motion.button>
                          )
                          })}</AnimatePresence>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
            </div>
          )}

          {/* CALIBRATION TAB */}
          

          

        
          {['driver_profile', 'economy'].includes(activeTab) && (
             <EconomyView player={player} track={activeTrack} />
          )}

          {['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) && (
            <RivalAnalysisTab t={t} settings={settings} setLocalSettings={setLocalSettings} player={player} track={activeTrack} weather={weather} />
         )}

         {['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-6">
                  
                  
                  <div id="calibration-view" className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                     <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-6">
                        <Wrench className="w-5 h-5 text-indigo-500" /> {t('Calibration (Test Laps)')}
                     </h2>
                     <CalibrationView player={player} setPlayer={setPlayer} />
                  </div>
               </div>
               
               <div className="lg:col-span-4">
                  <QuickNotes currentUser={currentUser} />
               </div>
            </div>
            )}
            
            {['assistant', 'rival_analysis', 'telemetry'].includes(activeTab) && (
               <React.Fragment>
                  <TelemetryContributeView player={player} weather={weather} selectedTrackId={selectedTrackId} constants={constants} />
                  <div className="mt-8">
                     <TeamDataPool currentUser={currentUser} />
                  </div>
               </React.Fragment>
            )}
            </React.Fragment>
          )}

        </main>
      </div>

      {showInAppNotification && (
         <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 shadow-xl rounded-2xl p-4 w-80 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
            <button onClick={() => setShowInAppNotification(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-start gap-3">
               <div className="bg-indigo-50 dark:bg-indigo-900/40 p-2 rounded-full text-indigo-500">
                  <Bell className="w-5 h-5" />
               </div>
               <div>
               <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">New Update Available</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{[...systemLogs, ...APP_NOTIFICATIONS][0]?.title}</p>
                  <button onClick={() => {setShowInAppNotification(false); setAppView('notifications');}} className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition">View details &rarr;</button>
               </div>
            </div>
         </div>
      )}

{appView === 'notifications' && (
      <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 shadow-sm rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" /> {t('In-App Notifications')}
            </h3>
            <div className="space-y-4">
              {[...systemLogs, ...APP_NOTIFICATIONS].filter(n => n.type === 'in-game').length === 0 ? (
                 <p className="text-sm text-slate-500 dark:text-slate-400">{t('No new notifications.')}</p>
              ) : [...systemLogs, ...APP_NOTIFICATIONS].filter(n => n.type === 'in-game').map(note => (
                 <div key={note.id} className="p-4 border rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800">
                    <div className="flex justify-between items-start">
                       <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">{t(note.title)}</p>
                       <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{t('Game')}</span>
                    </div>
                    <p className="text-xs mt-2 text-indigo-600 dark:text-indigo-400">{t(note.message)}</p>
                    <p className="text-[10px] mt-3 font-mono text-indigo-400 dark:text-indigo-500">{new Date(note.timestamp).toLocaleString()}</p>
                 </div>
              ))}
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 shadow-sm rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-500" /> {t('Update Notes History')}
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {[...systemLogs, ...APP_NOTIFICATIONS].filter(n => n.type === 'patch-note').map(note => (
                 <div key={note.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                       <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{t(note.title)}</p>
                       <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{t('Update')}</span>
                    </div>
                    <p className="text-xs mt-2 text-slate-600 dark:text-slate-400">{t(note.message)}</p>
                    <p className="text-[10px] mt-3 font-mono text-slate-400 dark:text-slate-500">{new Date(note.timestamp).toLocaleString()}</p>
                 </div>
              ))}
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 shadow-sm rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" /> {t('Send Feedback')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('Let us know what features you want next or report a bug. Your message will be sent securely to the developer.')}</p>
            <textarea 
               value={feedbackText}
               onChange={(e) => setFeedbackText(e.target.value)}
               className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4 dark:text-slate-200"
               placeholder={t('Type your feedback here...')}
            ></textarea>
            <div className="flex items-center gap-2 mb-4">
               <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Rating:</span>
               <select value={feedbackRating} onChange={e => setFeedbackRating(Number(e.target.value))} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none">
                  <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4)</option>
                  <option value={3}>⭐⭐⭐ (3)</option>
                  <option value={2}>⭐⭐ (2)</option>
                  <option value={1}>⭐ (1)</option>
               </select>
            </div>
            <div className="flex justify-between items-center gap-3">
               <div className="flex-1">
                  {feedbackSent && <span className="text-sm font-bold text-emerald-500">{t('Feedback Sent! Thank you.')}</span>}
               </div>
               <button 
                  onClick={handleSendFeedback} 
                  disabled={!feedbackText.trim() || feedbackSending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
               >
                  {feedbackSending ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t('Submit')}
               </button>
            </div>
         </div>
      </div>
   )}
   
      {!settings.onboardingSeen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 space-y-6">
               <div className="flex justify-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-full text-indigo-600 dark:text-indigo-400">
                     <CheckCircle className="w-12 h-12" />
                  </div>
               </div>
               <div className="text-center">
                  <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Welcome to Pitwall <span className="text-indigo-600">Pro</span>!</h2>
                  <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">To take full advantage of our strategy tools, please follow the initial setup steps.</p>
               </div>
               <div className="space-y-4">
                  <div className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 font-black w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                     <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Sync User Data</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your API Token in <span className="font-bold text-indigo-500">Settings</span> to auto-fetch Driver Data, Car Wear and Track Telemetry. You can select exactly which data gets pulled.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 font-black w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                     <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Prepare for Race</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verify track conditions and setup weather configurations in the <span className="font-bold text-indigo-500">Assistant</span> tab. The app predicts base pit times automatically!</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 font-black w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
                     <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Master Stints</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Modify Laps and select tyre compounds in Strategy planner. Compare fuel use instantly across strategy variants.</p>
                     </div>
                  </div>
               </div>
               <div className="flex justify-center pt-4">
                  <button 
                     onClick={() => setLocalSettings({...settings, onboardingSeen: true})}
                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 px-8 rounded-2xl transition shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                     Got it, let's start!
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
