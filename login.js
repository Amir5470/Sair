// @ts-nocheck
// login.js (type=module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCt_tXOLiYCD8w8OqqaD0X6H5HX51_B5bQ",
    authDomain: "sair11.firebaseapp.com",
    databaseURL: "https://sair11-default-rtdb.firebaseio.com",
    projectId: "sair11",
    storageBucket: "sair11.firebasestorage.app",
    messagingSenderId: "179481080318",
    appId: "1:179481080318:web:e942e5b0089028f6be90af",
    measurementId: "G-L5E7VWNQ2N"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleBtn = document.getElementById('googleSignIn');
const emailBtn = document.getElementById('emailSignIn');
const signupBtn = document.getElementById('emailSignup');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const authMessage = document.getElementById('authMessage');
const continueGuest = document.getElementById('continueGuest');
const openSettings = document.getElementById('openSettings');

function showMsg(txt, error = false) {
    authMessage.textContent = txt || '';
    authMessage.style.color = error ? 'crimson' : '';
}

googleBtn.addEventListener('click', async () => {
    // Open Google login in the system browser (main process will start local callback server)
    try {
        if (window.auth && typeof window.auth.loginWithGoogle === 'function') {
            window.auth.loginWithGoogle();
            showMsg('Opening system browser for Google sign-in...');
        } else {
            showMsg('Auth bridge not available', true);
            console.warn('window.auth.loginWithGoogle not available');
        }
    } catch (err) {
        showMsg(err.message, true);
    }
});

// Listen for OAuth code redirected to the local server
if (window.oauth && typeof window.oauth.onCode === 'function') {
    window.oauth.onCode((data) => {
        console.log('Received oauth data:', data);
        showMsg('Received OAuth code, complete sign-in...');
        // TODO: exchange code for tokens (main process or backend) and sign into Firebase
    });
}

emailBtn.addEventListener('click', async () => {
    try {
        const userCred = await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
        await ensureUserSettings(userCred.user.uid, userCred.user.email);
        showMsg('Signed in');
        setTimeout(() => window.close?.() || (location.href = 'settings.html'), 700);
    } catch (err) {
        showMsg(err.message, true);
    }
});

signupBtn.addEventListener('click', async () => {
    try {
        const userCred = await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
        await ensureUserSettings(userCred.user.uid, userCred.user.email);
        showMsg('Account created and signed in');
        setTimeout(() => window.close?.() || (location.href = 'settings.html'), 700);
    } catch (err) {
        showMsg(err.message, true);
    }
});

continueGuest.addEventListener('click', () => {
    localStorage.setItem('sair_guest', '1');
    location.href = 'settings.html';
});

openSettings.addEventListener('click', () => location.href = 'settings.html');

// create default settings doc if missing
async function ensureUserSettings(uid, email) {
    try {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            const defaults = {
                email: email || null,
                accent: '#3579df',
                searchEngine: 'duckduckgo',
                // other defaults
                timestamp: Date.now()
            };
            await setDoc(ref, defaults);
        }
    } catch (e) {
        console.warn('ensureUserSettings err', e);
    }
}

onAuthStateChanged(auth, user => {
    if (user) {
        // user signed in
        console.log('auth', user.uid, user.email);
    } else {
        console.log('not signed in');
    }
});

googleBtn.disabled = true;
googleBtn.innerText = "Opening browser...";

onAuthStateChanged(auth, user => {
    if (user) location.href = "settings.html";
});

document.getElementById("togglePass").onclick = () => {
    const p = passInput;
    p.type = p.type === "password" ? "text" : "password";
};

import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

document.getElementById("forgotPass").onclick = async () => {
    try {
        await sendPasswordResetEmail(auth, emailInput.value);
        showMsg("Password reset email sent");
    } catch (err) {
        showMsg(err.message, true);
    }
};
