import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Activity, Droplet, Settings, Clock, RefreshCw } from 'lucide-react';
import { TRACK_DATABASE } from '../data';

export default function TeamDataPool({ currentUser }) {
    const [dataList, setDataList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'telemetry_contributions'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDataList(list);
            setLoading(false);
        }, (error) => {
            console.error("Live Data Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getTrackName = (id) => {
        const track = TRACK_DATABASE.find(t => t.id === id);
        return track ? track.name : id;
    };

    if (!currentUser) {
         return (
             <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Lütfen canlı takım verilerini görmek için giriş yapın.
             </div>
         );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-500" />
                    Canlı Takım Veri Havuzu
                </h2>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Canlı Senkronizasyon Aktif
                </div>
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4 text-indigo-400" />
                    <p>Veriler yükleniyor...</p>
                </div>
            ) : dataList.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                    Henüz havuza gönderilmiş bir telemetri verisi bulunmuyor.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="pb-3 font-semibold">Tarih</th>
                                <th className="pb-3 font-semibold">Pist</th>
                                <th className="pb-3 font-semibold text-center"><Droplet className="w-4 h-4 inline-block mr-1"/>Yakıt</th>
                                <th className="pb-3 font-semibold text-center"><Activity className="w-4 h-4 inline-block mr-1"/>Lastik</th>
                                <th className="pb-3 font-semibold text-center"><Settings className="w-4 h-4 inline-block mr-1"/>Aşınma</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {dataList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="py-3 text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {new Date(item.timestamp).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                                        {getTrackName(item.trackId)} ({item.laps} Tur)
                                    </td>
                                    
                                    <td className="py-3 text-center">
                                        {item.modules?.fuel ? (
                                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded text-xs font-bold border border-indigo-100 dark:border-indigo-800/50">
                                                {item.modules.fuel.actual}L
                                            </span>
                                        ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                                    </td>
                                    
                                    <td className="py-3 text-center">
                                        {item.modules?.tyre ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold text-white ${item.modules.tyre.compound === 'Soft' ? 'bg-red-500' : item.modules.tyre.compound === 'Medium' ? 'bg-yellow-500' : item.modules.tyre.compound === 'Hard' ? 'bg-slate-200 text-slate-800' : item.modules.tyre.compound === 'Rain' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                    {item.modules.tyre.compound.charAt(0)}
                                                </span>
                                                <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-1 rounded text-xs font-bold border border-rose-100 dark:border-rose-800/50">
                                                    %{item.modules.tyre.actual}
                                                </span>
                                            </div>
                                        ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                                    </td>
                                    
                                    <td className="py-3 text-center">
                                        {item.modules?.parts ? (
                                            <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-xs font-bold border border-amber-100 dark:border-amber-800/50">
                                                %{item.modules.parts.actual}
                                            </span>
                                        ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
