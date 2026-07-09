// ============================================================
// ZAKHOURANI AI - UI RENDERING
// ============================================================
let allChats = [];
let chatId = null;
let freeTierClaimed = false;
let countdownInterval = null;

const UIManager = {
    updateUserUI(user) {
        if (user) {
            const name = user.displayName || user.email.split('@')[0];
            $('userName').textContent = name;
            $('userEmail').textContent = user.email;
            $('userAvatarText').textContent = name.charAt(0).toUpperCase();
            $('app').style.display = 'flex';
            $('loader').classList.add('hidden');
        } else {
            $('app').style.display = 'none';
            $('loader').classList.remove('hidden');
            $('loaderText').textContent = 'Please login...';
            Utils.showModal('authModal');
        }
    },

    async updateUsageUI(userEmail) {
        if (!userEmail) return;
        const limit = await SupabaseOps.checkLimit(userEmail);
        $('balanceCount').textContent = limit.remaining >= 999 ? '∞' : limit.remaining;
        $('balanceAmount').textContent = parseFloat(limit.balance || 0).toFixed(2);
        
        const percent = limit.total > 0 ? (limit.remaining / limit.total) * 100 : 100;
        $('balanceFill').style.width = percent + '%';
        $('balanceFill').className = 'usage-fill' + (percent < 15 ? ' danger' : percent < 35 ? ' warning' : '');
        $('userName').textContent = limit.username || $('userName').textContent;
        $('userAvatarText').textContent = (limit.username || 'Z').charAt(0).toUpperCase();
        
        this.updateFreeTierUI(limit.remaining);
