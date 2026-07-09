// ============================================================
// ZAKHOURANI AI - FIREBASE AUTHENTICATION
// Uses Firebase Compat SDK (firebase-app-compat.js)
// ============================================================
let zaiAuth = null;

const FirebaseAuth = {
    init() {
        try {
            // Check if Firebase is already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(ZAI_CONFIG.firebase);
                console.log('✅ Firebase initialized with config:', ZAI_CONFIG.firebase.projectId);
            }
            // Use firebase.auth() from compat SDK
            zaiAuth = firebase.auth();
            console.log('✅ Firebase Auth ready');
            return zaiAuth;
        } catch (e) {
            console.error('❌ Firebase init error:', e.message);
            throw e;
        }
    },

    getAuth() {
        if (!zaiAuth) {
            return this.init();
        }
        return zaiAuth;
    },

    async login(email, password) {
        const auth = this.getAuth();
        const result = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login successful:', result.user.email);
        return result;
    },

    async register(email, password) {
        const auth = this.getAuth();
        const result = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ Registration successful:', result.user.email);
        return result;
    },

    async logout() {
        const auth = this.getAuth();
        await auth.signOut();
        console.log('✅ Logout successful');
    },

    onAuthChange(callback) {
        const auth = this.getAuth();
        auth.onAuthStateChanged((user) => {
            console.log('👤 Auth state:', user ? user.email : 'logged out');
            callback(user);
        });
    }
};

console.log('🔧 Firebase Auth module loaded');
