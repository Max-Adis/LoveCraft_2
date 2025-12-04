// Firebase configuration
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

// REMPLACE CES VALEURS AVEC TES CLÉS FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyB...",
    authDomain: "lovecraft-surprise.firebaseapp.com",
    projectId: "lovecraft-surprise",
    storageBucket: "lovecraft-surprise.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export des fonctions Firebase
export { 
    db, 
    collection, 
    addDoc, 
    getDoc, 
    doc, 
    updateDoc, 
    increment 
};
