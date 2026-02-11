// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAE8wf24HXrfmpMluaFOv1OHPrf_YFfqTQ",
    authDomain: "whaai-c388e.firebaseapp.com",
    projectId: "whaai-c388e",
    storageBucket: "whaai-c388e.firebasestorage.app",
    messagingSenderId: "640598205524",
    appId: "1:640598205524:web:c975f5e8b371b1043e39c1",
    measurementId: "G-1MHE0JBZJR"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Auth State Listener
function initAuth(callback) {
    auth.onAuthStateChanged((user) => {
        if (callback) callback(user);
    });
}

// Check if user is authenticated
function checkAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            resolve(user);
        });
    });
}

// Email/Password Signup
async function signUpWithEmail(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName });
        await saveUserToFirestore(userCredential.user, 'email');
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Email/Password Login
async function loginWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        await updateLastLogin(userCredential.user);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Google Login
async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const userCredential = await auth.signInWithPopup(provider);
        await saveUserToFirestore(userCredential.user, 'google');
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// GitHub Login
async function loginWithGitHub() {
    try {
        const provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('user:email');
        
        const userCredential = await auth.signInWithPopup(provider);
        await saveUserToFirestore(userCredential.user, 'github');
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout
async function logoutUser() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Save/Update User in Firestore
async function saveUserToFirestore(user, provider) {
    try {
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff`,
            provider: provider,
            emailVerified: user.emailVerified || false,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

// Update Last Login
async function updateLastLogin(user) {
    try {
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating last login:', error);
    }
}

// Get Current User Data
async function getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Redirect if authenticated/not authenticated
function redirectIfAuthenticated(redirectTo = 'index.html') {
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.location.href = redirectTo;
        }
    });
}

function redirectIfNotAuthenticated(redirectTo = 'login.html') {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = redirectTo;
        }
    });
}
