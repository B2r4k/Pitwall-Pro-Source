import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  setLogLevel,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Firestore bağlantı uyarılarını gizle
setLogLevel("silent");

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth ve Firestore servislerini dışa aktar
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
