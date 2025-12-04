// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update,
    remove,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1hcyt4IVDtKcOw2JcVnCcLP5gOvPt4F0",
    authDomain: "lovecraft-web.firebaseapp.com",
    databaseURL: "https://lovecraft-web-default-rtdb.firebaseio.com",
    projectId: "lovecraft-web",
    storageBucket: "lovecraft-web.firebasestorage.app",
    messagingSenderId: "28643241616",
    appId: "1:28643241616:web:616f5aa143d739cd0f3215",
    measurementId: "G-L1N4GTS1EL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
    database, auth, googleProvider,
    ref, set, get, update, remove, query, orderByChild, equalTo,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signInWithPopup, signOut, onAuthStateChanged
};
