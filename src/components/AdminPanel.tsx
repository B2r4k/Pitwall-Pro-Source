import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Archive, ChevronRight, MessageSquare, Star, Clock, Calendar, Upload, Save, Info, HelpCircle, AlertTriangle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { t } from '../i18n';
import { TRACK_DATABASE } from '../data';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
   const [feedbacks, setFeedbacks] = useState<any[]>([]);
   const [telemetries, setTelemetries] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [currentTelemetryIdx, setCurrentTelemetryIdx] = useState(0);
   const [expandedTelemetry, setExpandedTelemetry] = useState(false);
   
   // Calendar State
   const [calendarJson, setCalendarJson] = useState<string>('[\n  { "name": "Bahrain Grand Prix", "trackId": "bahrain", "date": "2026-03-01T15:00:00Z" }\n]');
   const [isSavingCalendar, setIsSavingCalendar] = useState(false);
   const [isOcrProcessing, setIsOcrProcessing] = useState(false);
   const [ocrLog, setOcrLog] = useState('');
   const [dateDetectMethod, setDateDetectMethod] = useState<{ format: string, sure: boolean } | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const loadData = async (user) => {
         if (user?.email !== 'burakis204@gmail.com') return;
         try {
            const q = query(collection(db, 'feedback'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
            // local sort
            data.sort((a, b) => {
               const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || 0).getTime();
               const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || 0).getTime();
               return tb - ta;
            });
            setFeedbacks(data);
            
            const qTel = query(collection(db, 'telemetry_contributions'));
            const snapTel = await getDocs(qTel);
            const telData = snapTel.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
            telData.sort((a, b) => {
               const ta = new Date(a.timestamp || 0).getTime();
               const tb = new Date(b.timestamp || 0).getTime();
               return tb - ta;
            });
            setTelemetries(telData);
            
            // Load calendar
            const calSnap = await getDoc(doc(db, 'global_settings', 'calendar'));
            if (calSnap.exists() && calSnap.data().data) {
               setCalendarJson(JSON.stringify(calSnap.data().data, null, 2));
            }
         } catch (err: any) {
            if (err.message?.includes('offline')) {
               console.warn('Admin data: Client is offline. Cannot fetch data.');
            } else {
               console.error('Error loading admin data:', err);
            }
         } finally {
            setLoading(false);
         }
      };
      const unsub = auth.onAuthStateChanged((user) => {
         if (user) loadData(user);
      });
      return () => unsub();
   }, []);

   const saveCalendar = async () => {
      try {
         setIsSavingCalendar(true);
         const parsed = JSON.parse(calendarJson);
         await setDoc(doc(db, 'global_settings', 'calendar'), { data: parsed });
         alert('Calendar saved successfully to cloud!');
      } catch (err) {
         console.error(err);
         alert('Error saving calendar. Invalid JSON?');
      } finally {
         setIsSavingCalendar(false);
      }
   };

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsOcrProcessing(true);
      setOcrLog('Scanning image for calendar data...');
      try {
         const result = await Tesseract.recognize(file, 'eng', {
            logger: m => {
               if (m.status === 'recognizing text') {
                  setOcrLog(`Scanning... ${Math.round(m.progress * 100)}%`);
               }
            }
         });
         
         setOcrLog('Analyzing text patterns and dates...');
         
         const text = result.data.text;
         const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
         
         // Helper to extract written date (e.g., 12 Haz, 2026 OR 14th of August)
         const extractWrittenDate = (str: string) => {
            const months: Record<string, number> = {
               jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, 
               apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7, 
               aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10, 
               nov: 11, november: 11, dec: 12, december: 12,
               oca: 1, ocak: 1, şub: 2, sub: 2, subat: 2, şubat: 2,
               nis: 4, nisan: 4, haz: 6, haziran: 6, tem: 7, temmuz: 7,
               ağu: 8, agu: 8, agustos: 8, ağustos: 8, eyl: 9, eylul: 9, eylül: 9,
               eki: 10, ekim: 10, kas: 11, kasim: 11, kasım: 11, ara: 12, aralik: 12, aralık: 12
            };
            
            const lowerStr = str.toLowerCase();
            for (const [mName, mNum] of Object.entries(months)) {
               // We need exact word match for short months like 'mar' or 'may' to avoid matching 'format'
               const regex = new RegExp(`\\b${mName}\\b`, 'i');
               if (regex.test(lowerStr)) {
                  // Found a month, now find a day (1-31)
                  const dayMatch = str.match(/(?<!\d)([1-9]|[12]\d|3[01])(?!\d)/);
                  if (dayMatch) {
                     // Get year if exists
                     const yearMatch = str.match(/\b(202\d)\b/);
                     const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
                     let day = parseInt(dayMatch[1]);
                     return new Date(Date.UTC(year, mNum - 1, day, 18, 0, 0)); // 18:00 UTC (21:00 TR)
                  }
               }
            }
            return null;
         };

         // 1. Extract dates out of lines (Numeric formats X/Y/Z)
         const dateRegex = /\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/g;
         let isDDMM = false;
         let isMMDD = false;
         
         lines.forEach(line => {
             const m = dateRegex.exec(line);
             if (m) {
                 const p1 = parseInt(m[1]);
                 const p2 = parseInt(m[2]);
                 if (p1 > 12) isDDMM = true;
                 if (p2 > 12) isMMDD = true;
             }
         });
         
         const sure = isDDMM || isMMDD;
         const useFormat = isMMDD ? 'MM/DD' : (isDDMM ? 'DD/MM' : 'DD/MM (Default Guess)');
         setDateDetectMethod({ format: useFormat, sure });
         setOcrLog(`Date structure detected. Continuing parse...`);
         
         // We just want to extract from lines starting with "1.", "2." ... "17." or "T." or "Test"
         // To handle bad OCR, we can allow a space: "1 .", "1,", "T ," etc.
         // Or just rely on TRACK_DATABASE but strictly ignore long conversational messages.
         
         const foundTracks: any[] = [];
         let firstDateFound: Date | null = null;
         
         // Clean noise and find lists
         for (let i = 0; i < lines.length; i++) {
             const line = lines[i];
             const lowerLine = line.toLowerCase();
             
             // Try to extract date from the line
             let dateObj: Date | null = null;
             const dMatch = line.match(/\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/);
             if (dMatch) {
                 const p1 = parseInt(dMatch[1]);
                 const p2 = parseInt(dMatch[2]);
                 const p3 = dMatch[3] ? parseInt(dMatch[3]) : new Date().getFullYear();
                 let day = p1, month = p2, year = p3;
                 if (useFormat.startsWith('MM/DD')) { month = p1; day = p2; }
                 if (year < 100) year += 2000;
                 dateObj = new Date(Date.UTC(year, month - 1, day, 18, 0, 0)); // Force 18:00 UTC = 21:00 TRT
             } else {
                 dateObj = extractWrittenDate(line);
             }
             if (dateObj && !firstDateFound) firstDateFound = dateObj;

             // Pattern Recognition: Look for GPRO typical numbered list or Test track.
             // Regex: matches "1. ", "T. ", "17.", "Test track: ", etc.
             const listMatch = line.match(/^(?:\s*(?:[tT]|1[0-7]|[1-9])\s*[\.\,\|:]\s*|test\s*track\s*:\s*|T\s*\|\s*)/i);
             
             let trackNameStr = "";
             if (listMatch) {
                 // Remove the prefix (like "1. " or "T | ")
                 trackNameStr = line.substring(listMatch[0].length).trim();
             } else {
                 // Fallback: Does it look like a track line inside a table?
                 // OCR sometimes misses "1." but it has "Track Name GP | 12 Haz"
                 if (line.includes(' GP ') || line.includes('(') || line.includes('|') || line.includes('-') || line.includes('Haz') || line.includes('Tem') || line.includes('Ağu') || line.includes('Eyl') || line.includes('Eki')) {
                     trackNameStr = line.trim();
                 }
                 
                 // Deep Fallback: Check if ANY known track name exists in the line
                 if (!trackNameStr) {
                     for (const t of TRACK_DATABASE) {
                         if (lowerLine.includes(t.name.toLowerCase()) || lowerLine.includes(t.id.toLowerCase())) {
                             trackNameStr = line.trim();
                             break;
                         }
                     }
                 }
             }

             if (trackNameStr) {
                 // Stop processing if it hits conversational text "first race is scheduled..."
                 if (lowerLine.includes('first race is') || lowerLine.includes('thank you')) continue;
                 
                 // Clean up trackNameStr: remove dates like "12 Haz, 2026" or "12/04/2026"
                 trackNameStr = trackNameStr.replace(/\b([1-9]|[12]\d|3[01])\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|oca|ocak|şub|sub|subat|şubat|nis|nisan|haz|haziran|tem|temmuz|ağu|agu|agustos|ağustos|eyl|eylul|eylül|eki|ekim|kas|kasim|kasım|ara|aralik|aralık).*$/i, '').trim();
                 trackNameStr = trackNameStr.replace(/\b\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?.*$/, '').trim();
                 
                 // Clean up table columns leftovers like "| T. Parker" or " | "
                 trackNameStr = trackNameStr.split('|')[0].trim();
                 
                 // If it's too short, skip
                 if (trackNameStr.length < 3) continue;

                 // Match with database to get an ID strictly for known tracks
                 const matchedTrack = TRACK_DATABASE.find(t => 
                     trackNameStr.toLowerCase().replace(/[^a-z0-9]/g, '').includes(t.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
                 );

                 // Only add if we actually matched a track OR if it strictly started with a number/T
                 if (matchedTrack || listMatch) {
                     const fName = matchedTrack ? matchedTrack.name : trackNameStr;
                     // Prevent duplicates
                     if (!foundTracks.find(ft => ft.name === fName)) {
                         foundTracks.push({
                             name: fName,
                             trackId: matchedTrack ? matchedTrack.id : 'custom_' + trackNameStr.replace(/\s+/g, '_').toLowerCase(),
                             date: dateObj ? dateObj.toISOString() : null
                         });
                     }
                 }
             }
         }
         
         // If no dates found next to tracks, try finding ANY date in the whole text (like the "first race is..." text)
         if (!firstDateFound) {
            for (const line of lines) {
                const wDate = extractWrittenDate(line);
                if (wDate) {
                   firstDateFound = wDate;
                   break;
                }
                const dMatch = line.match(/\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/);
                if (dMatch) {
                   const p1 = parseInt(dMatch[1]);
                   const p2 = parseInt(dMatch[2]);
                   const p3 = dMatch[3] ? parseInt(dMatch[3]) : new Date().getFullYear();
                   let day = p1, month = p2, year = p3;
                   if (useFormat.startsWith('MM/DD')) { month = p1; day = p2; }
                   if (year < 100) year += 2000;
                   firstDateFound = new Date(Date.UTC(year, month - 1, day, 18, 0, 0));
                   break;
                }
            }
         }

         // Calculate fallback dates if some are missing, using GPRO standard sequence (Tue / Fri)
         if (foundTracks.length > 0) {
             let currentDate = firstDateFound || new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 18, 0, 0));
             
             // Ensure it's roughly starting on a Tuesday (2) or Friday (5).
             while (currentDate.getUTCDay() !== 2 && currentDate.getUTCDay() !== 5) {
                 currentDate = new Date(currentDate.getTime() + 86400000);
             }

             const newCalendar = foundTracks.map((tr, idx) => {
                 // For missing ones or sequence generation
                 if (idx > 0) {
                     // Next race is +3 days or +4 days depending if current is Tue or Fri
                     const daysToAdd = currentDate.getUTCDay() === 2 ? 3 : 4;
                     currentDate = new Date(currentDate.getTime() + (daysToAdd * 86400000));
                 }
                 
                 return {
                     name: tr.name,
                     trackId: tr.trackId,
                     date: tr.date || currentDate.toISOString()
                 };
             });

             setCalendarJson(JSON.stringify(newCalendar, null, 2));
             setOcrLog(`Found ${newCalendar.length} tracks. Extrapolated GPRO dates (Tue/Fri) from ${newCalendar[0].date}.`);
         } else {
             setOcrLog('No known tracks matched. Dumping raw text.');
             const newJson = lines.map((l, i) => {
                 return `  { "name": "${l.replace(/"/g, '')}", "trackId": "unknown_${i}", "date": "2026-01-01T18:00:00Z" }`;
             }).join(',\n');
             setCalendarJson(`[\n${newJson}\n]`);
         }
         
         setTimeout(() => setOcrLog(''), 5000);
      } catch (err) {
         console.error(err);
         setOcrLog('Error during OCR.');
         setTimeout(() => setOcrLog(''), 3000);
      } finally {
         setIsOcrProcessing(false);
         if (fileInputRef.current) fileInputRef.current.value = '';
      }
   };

   if (auth.currentUser?.email !== 'burakis204@gmail.com') {
      return null;
   }

   const totalFeedbacks = feedbacks.length;
   const avgRating = totalFeedbacks > 0 
      ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalFeedbacks).toFixed(1) 
      : '0.0';

   return (
      <div className="space-y-6">
         {/* Top Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-sm text-slate-500 font-bold mb-1 flex items-center gap-1.5"><MessageSquare className="w-4 h-4"/> Total Feedbacks</p>
                  <h3 className="text-4xl justify-end font-black text-slate-800 dark:text-slate-100">{totalFeedbacks}</h3>
               </div>
               <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Archive className="w-6 h-6" />
               </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-sm text-slate-500 font-bold mb-1 flex items-center gap-1.5"><Star className="w-4 h-4"/> Avg Rating</p>
                  <h3 className="text-4xl justify-end font-black text-yellow-600 dark:text-yellow-500">{avgRating}</h3>
               </div>
               <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                  <Star className="w-6 h-6" />
               </div>
            </div>
         </div>

         {/* Calendar Cloud Manager */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-indigo-500"/> Global Calendar Manager
            </h3>
            <p className="text-sm text-slate-500 mb-4">
               Update the F1 calendar stored in the Cloud. The game uses this JSON format to detect the active race. You can upload an image of the track list to auto-extract the text into JSON structure.
            </p>
            
            <div className="mb-4">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isOcrProcessing}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4"/> 
                  {isOcrProcessing ? 'Scanning Image...' : 'Upload Calendar Image (OCR)'}
                </button>
                {ocrLog && <p className="text-xs text-indigo-500 font-medium mt-2">{ocrLog}</p>}
                
                {dateDetectMethod && (
                   <div className="mt-2 flex items-center gap-2 text-xs font-mono font-bold">
                       <span className={`flex items-center gap-1 ${dateDetectMethod.sure ? 'text-emerald-500' : 'text-red-500'}`}>
                          <Info className="w-4 h-4" /> 
                          {t('Date Detection:')} {dateDetectMethod.format}
                       </span>
                   </div>
                )}
            </div>

            <textarea
               className="w-full h-48 md:h-64 p-4 font-mono text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
               value={calendarJson}
               onChange={e => setCalendarJson(e.target.value)}
               placeholder="[{ 'name': 'Bahrain Grand Prix', 'trackId': 'bahrain', 'date': '2026-03-01T15:00:00Z' }]"
            ></textarea>
            
            <div className="mt-4 flex justify-end">
               <button 
                  onClick={saveCalendar}
                  disabled={isSavingCalendar}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
               >
                  <Save className="w-4 h-4"/> 
                  {isSavingCalendar ? 'Saving...' : 'Save Calendar to Cloud'}
               </button>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-200 flex items-center gap-2"><Clock className="w-5 h-5"/> Telemetry Contributions</h3>
            {loading ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">Yükleniyor...</div>
            ) : telemetries.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">Hiç katkı yok.</div>
            ) : (
                <div className="relative">
                    {/* Controls */}
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentTelemetryIdx(Math.max(0, currentTelemetryIdx - 1))} disabled={currentTelemetryIdx === 0} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold disabled:opacity-30">Önceki</button>
                        <span className="text-sm font-bold text-slate-500">{currentTelemetryIdx + 1} / {telemetries.length}</span>
                        <button onClick={() => setCurrentTelemetryIdx(Math.min(telemetries.length - 1, currentTelemetryIdx + 1))} disabled={currentTelemetryIdx === telemetries.length - 1} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold disabled:opacity-30">Sonraki</button>
                    </div>

                    {telemetries[currentTelemetryIdx] && (() => {
                        const tel = telemetries[currentTelemetryIdx];
                        const failedStr = Object.entries(tel.failedChecks || {})
                            .filter(([_, failed]) => failed)
                            .map(([key]) => key)
                            .join(', ') || 'Yok';
                        
                        return (
                            <div className="border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-slate-800/50 p-4 rounded-xl relative">
                                <div className="absolute top-4 right-4 flex gap-2">
                                   <button onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(tel, null, 2));
                                        alert("Kopyalandı!");
                                   }} className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold transition">Kopyala</button>
                                   <button onClick={() => setExpandedTelemetry(!expandedTelemetry)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded font-bold transition">
                                       {expandedTelemetry ? 'Küçült' : 'Büyüt'}
                                   </button>
                                </div>
                                <p className="text-xs text-slate-500 font-mono mb-2">{new Date(tel.timestamp).toLocaleString()} | Track: {tel.trackId}</p>
                                
                                {expandedTelemetry ? (
                                    <pre className="text-xs font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto whitespace-pre-wrap mt-4 text-slate-700 dark:text-slate-300">
                                        {JSON.stringify(tel, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1"><HelpCircle className="w-3 h-3"/> Hata Oranı / Bil. Değ.</p>
                                            <p className="text-lg font-mono font-black text-indigo-600 dark:text-indigo-400">{(tel.errorRate || tel.unknownFactor || 0).toFixed(3)}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500"/> Başarısız Kısımlar</p>
                                            <p className="text-sm font-bold text-red-500">{failedStr}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 text-right">Laps / Temp Match</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 text-right">
                                                {tel.laps} Laps / {tel.weather?.tempMax}°C Max
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()}
                </div>
            )}
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-200 flex items-center gap-2"><Clock className="w-5 h-5"/> Recent Feedback</h3>
            {loading ? (
               <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading feedbacks...</div>
            ) : feedbacks.length === 0 ? (
               <div className="text-center py-8 text-slate-500 dark:text-slate-400">No feedbacks yet.</div>
            ) : (
               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {feedbacks.map(fb => (
                     <div key={fb.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                        <span className="absolute top-4 right-4 text-xs font-mono text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition">
                           {fb.timestamp?.toDate 
                              ? typeof fb.timestamp.toDate === 'function' ? fb.timestamp.toDate().toLocaleString() : new Date(fb.timestamp).toLocaleString()
                              : fb.timestamp ? new Date(fb.timestamp).toLocaleString() : ''}
                        </span>
                        
                        <div className="mb-3 flex items-center gap-2 text-sm text-yellow-500 font-bold">
                           <div className="flex gap-0.5">
                              {Array.from({length: 5}).map((_, i) => (
                                 <Star key={i} className={`w-3.5 h-3.5 ${i < (fb.rating || 0) ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`}/> 
                              ))}
                           </div>
                           <span className="text-slate-500 dark:text-slate-400 text-xs ml-2">{fb.rating}/5</span>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{fb.text}</p>
                        
                        {fb.email && <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 text-xs text-indigo-500 dark:text-indigo-400 font-mono inline-flex px-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center py-1.5">{fb.email}</div>}
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
