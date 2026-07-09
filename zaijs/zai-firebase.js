// ============================================================
// ZAKHOURANI AI - FIREBASE AUTHENTICATION
// Uses Firebase Compat SDK (firebase-app-compat.js)
// ============================================================
let zaiAuth = null;

const FirebaseAuth = {
    init() {
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(ZAI_CONFIG.firebase);
        }
        // Use firebase.auth() from compat SDK
        zaiAuth = firebase.auth();
        console.log('✅ Firebase Auth initialized');
        return zaiAuth;
    },

    getAuth() {
        if (!zaiAuth) {
            return this.init();
        }
        return zaiAuth;
    },

    async login(email, password) {
        const auth = this.getAuth();
        await auth.signInWithEmailAndPassword(email, password);
    },

    async register(email, password) {
        const auth = this.getAuth();
        await auth.createUserWithEmailAndPassword(email, password);
    },

    async logout() {
        const auth = this.getAuth();
        await auth.signOut();
    },

    onAuthChange(callback) {
        const auth = this.getAuth();
        auth.onAuthStateChanged(callback);
    }
};

// Initialize immediately when script loads
console.log('🔧 Firebase module loaded');
