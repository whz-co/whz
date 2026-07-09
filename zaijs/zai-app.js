// ============================================================
// ZAKHOURANI AI - MAIN APPLICATION INITIALIZATION
// ============================================================
window._userEmail = '';

const App = {
    async init() {
        // Create network background
        this._createNetworkBg();
        
        // Load theme
        if (localStorage.getItem('zk_theme') === 'light') {
            document.body.classList.add('light');
            $('themeBtn').innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Start countdown
        UIManager.startCountdown();
        
        // Initialize Firebase
        FirebaseAuth.init();
        
        // Listen for auth changes
        FirebaseAuth.onAuthChange(async (user) => {
            $('loaderText').textContent = 'Loading...';
            
            if (user) {
                window._userEmail = user.email;
                UIManager.updateUserUI(user);
                await UIManager.updateUsageUI(user.email);
                
                const supabaseUser = await SupabaseOps.getUser(user.email, $('userName').textContent);
                let chats = await SupabaseOps.loadChats(supabaseUser.id);
                
                if (!chats.length) {
                    const c = await SupabaseOps.createChat(supabaseUser.id, 'Welcome to Zakhourani AI');
                    chats = [c];
                }
                
                chatId = chats[0].id;
                allChats = chats;
                await UIManager.openChatView(chatId);
                await UIManager.renderChats(user.email);
                
                $('loader').classList.add('hidden');
                $('app').style.display = 'flex';
                $('messageInput').focus();
                
                const limit = await SupabaseOps.checkLimit(user.email);
                Utils.toast(limit.remaining > 0 ? '🧠 Zakhourani AI Ready' : '🎁 Claim your free tier', 2000);
                if (limit.remaining > 0) AudioSystem.success();
            } else {
                $('app').style.display = 'none';
                $('loader').classList.remove('hidden');
                $('loaderText').textContent = 'Please login...';
                Utils.showModal('authModal');
            }
        });
        
        // Bind events
        this._bindEvents();
    },
    
    _createNetworkBg() {
        const bg = $('netBg');
        for (let i = 0; i < 25; i++) {
            const dot = document.createElement('div');
            dot.className = 'net-dot c' + (Math.floor(Math.random() * 4) + 1);
            dot.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*5}s`;
            bg.appendChild(dot);
        }
    },
    
    _bindEvents() {
        $('sendButton').onclick = () => ChatManager.sendMessage(window._userEmail);
        
        $('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                ChatManager.sendMessage(window._userEmail);
            }
        });
        
        $('authLoginBtn').onclick = async () => {
            const email = $('authEmail').value.trim();
            const password = $('authPassword').value;
            if (!email || !password) {
                $('authError').textContent = 'Enter email & password';
                return;
            }
            try {
                await FirebaseAuth.login(email, password);
                Utils.closeModal('authModal');
                AudioSystem.success();
            } catch (err) {
                $('authError').textContent = err.message;
            }
        };
        
        $('authRegisterBtn').onclick = async () => {
            const email = $('authEmail').value.trim();
            const password = $('authPassword').value;
            if (!email || !password || password.length < 6) {
                $('authError').textContent = 'Min 6 characters';
                return;
            }
            try {
                await FirebaseAuth.register(email, password);
                Utils.closeModal('authModal');
                AudioSystem.claim();
            } catch (err) {
                $('authError').textContent = err.message;
            }
        };
        
        document.querySelectorAll('.chip').forEach(c => {
            c.onclick = () => {
                $('messageInput').value = c.dataset.prompt;
                ChatManager.sendMessage(window._userEmail);
            };
        });
        
        $('freeTierBtn').onclick = () => ChatManager.activateFreeTier(window._userEmail);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
                $('sidebar').classList.remove('open');
                $('sidebarOverlay').classList.remove('show');
            }
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                $('messageInput').focus();
            }
        });
    }
};

// Start the application
document.addEventListener('DOMContentLoaded', () => App.init());
