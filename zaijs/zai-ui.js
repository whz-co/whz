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
    },

    updateFreeTierUI(remaining) {
        if (remaining > 0) {
            $('freeTierCard').style.display = 'none';
            freeTierClaimed = true;
        } else {
            $('freeTierCard').style.display = 'block';
            $('freeTierBtn').disabled = false;
            freeTierClaimed = false;
        }
    },

    async renderChats(userEmail) {
        const user = await SupabaseOps.getUser(userEmail, $('userName').textContent);
        if (!user) return;
        const chats = await SupabaseOps.loadChats(user.id);
        allChats = chats;
        const list = $('conversationList');
        
        if (!chats.length) {
            list.innerHTML = '<div style="text-align:center;color:var(--text3);padding:40px">No conversations</div>';
            return;
        }
        
        list.innerHTML = chats.map(c => `
            <div class="conv-item${c.id === chatId ? ' active' : ''}" onclick="ChatManager.openChat('${c.id}')">
                <span class="conv-item-title">💬 ${c.title}</span>
                <div class="conv-item-actions">
                    <button onclick="event.stopPropagation();ChatManager.renamePrompt('${c.id}','${c.title}')">✏️</button>
                    <button onclick="event.stopPropagation();ChatManager.deleteChat('${c.id}')" style="color:var(--danger)">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    async openChatView(id) {
        if (!Utils.isValidUUID(id)) return;
        chatId = id;
        const msgs = await SupabaseOps.loadMessages(id);
        const container = $('chatContainer');
        
        if (!msgs.length) {
            container.innerHTML = '<div class="welcome"><div class="welcome-icon">🧠</div><h2>Start the conversation</h2></div>';
        } else {
            container.innerHTML = msgs.map(m => `
                <div class="message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}">
                    ${Utils.formatText(m.content)}
                    ${m.role === 'assistant' ? '<div class="powered-by">Zakhourani AI</div>' : ''}
                    <div class="msg-actions">
                        <button onclick="ChatManager.copyMessage(this)"><i class="fas fa-copy"></i></button>
                        <button onclick="ChatManager.speakMessage(this)"><i class="fas fa-volume-up"></i></button>
                    </div>
                </div>
            `).join('');
        }
        
        container.scrollTop = 0;
        $('chatTitle').textContent = allChats.find(x => x.id === id)?.title || 'Chat';
        await this.renderChats(window._userEmail);
        if (window.innerWidth < 1024) Utils.toggleSidebar();
    },

    startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        const tick = () => {
            const now = new Date();
            const reset = new Date(now);
            reset.setUTCHours(24, 0, 0, 0);
            if (now >= reset) reset.setDate(reset.getDate() + 1);
            const diff = reset - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            
            $('countdownText').innerHTML = `Resets in <span class="time">${timeStr}</span>`;
            if ($('limitModal').classList.contains('show')) {
                $('limitTimer').textContent = `⏰ ${h}h ${m}m ${s}s`;
            }
        };
        tick();
        countdownInterval = setInterval(tick, 1000);
    },

    async showProfileModal(userEmail) {
        const user = await SupabaseOps.getUser(userEmail, $('userName').textContent);
        const limit = await SupabaseOps.checkLimit(userEmail);
        $('profileEmail').textContent = userEmail;
        $('profileName').value = user.display_name || '';
        $('profileStats').innerHTML = `
            <div class="stat-card"><div class="stat-val">${limit.remaining}</div><div class="stat-lbl">Remaining</div></div>
            <div class="stat-card"><div class="stat-val">${limit.total_used || 0}</div><div class="stat-lbl">Used</div></div>
            <div class="stat-card"><div class="stat-val">${allChats.length}</div><div class="stat-lbl">Chats</div></div>
            <div class="stat-card"><div class="stat-val">$${parseFloat(limit.balance || 0).toFixed(2)}</div><div class="stat-lbl">Balance</div></div>
        `;
        Utils.showModal('profileModal');
    },

    async showPackagesModal(userEmail) {
        const limit = await SupabaseOps.checkLimit(userEmail);
        const pkgs = await SupabaseOps.loadPackages();
        $('packagesBalance').textContent = '$' + parseFloat(limit.balance || 0).toFixed(2);
        $('packagesList').innerHTML = pkgs.map(p => `
            <div class="pkg-card${p.is_popular ? ' popular' : ''}" onclick="ChatManager.purchasePackage('${p.id}')">
                <div><h4>${p.name}</h4><small>${p.questions_per_day === 999999 ? 'Unlimited' : p.questions_per_day + '/day'} · ${p.validity_days}d</small></div>
                <div class="price">$${p.price}</div>
            </div>
        `).join('');
        Utils.showModal('packagesModal');
    }
};
