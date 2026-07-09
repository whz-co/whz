// ============================================================
// ZAKHOURANI AI - FIREBASE AUTHENTICATION
// ============================================================
let zaiAuth = null;

const FirebaseAuth = {
    init() {
        if (!firebase.apps.length) {
            firebase.initializeApp(ZAI_CONFIG.firebase);
        }
        zaiAuth = firebase.auth();
        return zaiAuth;
    },

    getAuth() {
        return zaiAuth || this.init();
    },

    async login(email, password) {
        await this.getAuth().signInWithEmailAndPassword(email, password);
    },

    async register(email, password) {
        await this.getAuth().createUserWithEmailAndPassword(email, password);
    },

    async logout() {
        await this.getAuth().signOut();
    },

    onAuthChange(callback) {
        this.getAuth().onAuthStateChanged(callback);
    }
};
