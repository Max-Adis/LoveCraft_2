// Firebase configuration - MODIFIÉ POUR FIRESTORE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDoc, 
    doc, 
    updateDoc,
    increment 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// TES CLÉS FIREBASE (celles que tu as partagées)
const firebaseConfig = {
  apiKey: "AIzaSyB1hcyt4IVDtKcOw2JcVnCcLP5gOvPt4F0",
  authDomain: "lovecraft-web.firebaseapp.com",
  projectId: "lovecraft-web",
  storageBucket: "lovecraft-web.firebasestorage.app",
  messagingSenderId: "28643241616",
  appId: "1:28643241616:web:616f5aa143d739cd0f3215",
  measurementId: "G-L1N4GTS1EL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export des fonctions Firebase
export { 
    db, 
    collection, 
    addDoc, 
    getDoc, 
    doc, 
    updateDoc, 
    increment,
    analytics 
};
