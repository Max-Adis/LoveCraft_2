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
    sendPasswordResetEmail,
    updateProfile,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { 
    database, auth, storage, googleProvider,
    ref, set, get, update, remove, query, orderByChild, equalTo,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signInWithPopup, sendPasswordResetEmail, updateProfile, signOut, onAuthStateChanged,
    storageRef, uploadBytes, getDownloadURL
};
