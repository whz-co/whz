// ============================================================
// ZAKHOURANI AI - CHAT & MESSAGE HANDLING
// ============================================================
let busy = false;

const ChatManager = {
    async sendMessage(userEmail) {
        const input = $('messageInput');
        const text = input.value.trim();
        if (!text || busy) return;

        const limit = await SupabaseOps.checkLimit(userEmail);
        if (!limit.can_ask) {
            Utils.showModal('limitModal');
            UIManager.startCountdown();
            return;
        }
        if (!(await this._incrementUsage(userEmail))) return;

        busy = true;
        $('sendButton').disabled = true;

        if (!chatId || !Utils.isValidUUID(chatId)) {
            const user = await SupabaseOps.getUser(userEmail, $('userName').textContent);
            const chat = await SupabaseOps.createChat(user.id, 'New Conversation');
            chatId = chat.id;
            await UIManager.renderChats(userEmail);
            $('chatTitle').textContent = 'New Chat';
        }

        const container = $('chatContainer');
        if (container.querySelector('.welcome')) container.innerHTML = '';
        const freeCard = container.querySelector('.free-tier-card');
        if (freeCard) freeCard.remove();

        // User message
        const userDiv = document.createElement('div');
        userDiv.className = 'message user-msg';
        userDiv.textContent = text;
        container.appendChild(userDiv);
        container.scrollTop = container.scrollHeight;

        const user = await SupabaseOps.getUser(userEmail, $('userName').textContent);
        await SupabaseOps.saveMessage(chatId, user.id, 'user', text, 'Zakhourani');
        input.value = '';
        AudioSystem.send();

        // Typing indicator
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;

        try {
            const response = await fetch(ZAI_CONFIG.workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text, history: [] })
            });
            const data = await response.json();
            typing.remove();

            if (data.success && data.reply) {
                const aiDiv = document.createElement('div');
                aiDiv.className = 'message ai-msg';
                aiDiv.innerHTML = Utils.formatText(data.reply) + '<div class="powered-by">Zakhourani AI</div>';
                container.appendChild(aiDiv);
                container.scrollTop = container.scrollHeight;

                await SupabaseOps.saveMessage(chatId, user.id, 'assistant', data.reply, 'Zakhourani');

                const msgs = await SupabaseOps.loadMessages(chatId);
                if (msgs.length <= 2) {
                    const title = text.slice(0, 35) + (text.length > 35 ? '...' : '');
                    await SupabaseOps.renameChat(chatId, title);
                    $('chatTitle').textContent = title;
                    await UIManager.renderChats(userEmail);
                }
                AudioSystem.success();
            }
        } catch (e) {
            typing.remove();
        }

        busy = false;
        $('sendButton').disabled = false;
        input.focus();
    },

    async _incrementUsage(userEmail) {
        const limit = await SupabaseOps.checkLimit(userEmail);
        if (!limit.can_ask) return false;
        await SupabaseOps.incrementUsage(userEmail);
        await UIManager.updateUsageUI(userEmail);
        return true;
    },

    async openChat(id) {
        await UIManager.openChatView(id);
    },

    async createNewChat(userEmail) {
        const user = await SupabaseOps.getUser(userEmail, $('userName').textContent);
        if (!user) return;
        const chat = await SupabaseOps.createChat(user.id, 'New Conversation');
        chatId = chat.id;
        $('chatContainer').innerHTML = '<div class="welcome"><div class="welcome-icon">🧠</div><h2>New conversation</h2></div>';
        $('chatTitle').textContent = 'New Chat';
        await UIManager.renderChats(userEmail);
        if (window.innerWidth < 1024) Utils.toggleSidebar();
        $('messageInput').focus();
        Utils.toast('✨ New conversation');
    },

    async deleteChat(id) {
        if (!confirm('Delete?')) return;
        await SupabaseOps.deleteChat(id);
        const user = await SupabaseOps.getUser(window._userEmail, $('userName').textContent);
        const chats = await SupabaseOps.loadChats(user.id);
        chatId = chats.length ? chats[0].id : null;
        if (!chatId) {
            const c = await SupabaseOps.createChat(user.id, 'New Conversation');
            chatId = c.id;
        }
        await this.openChat(chatId);
        await UIManager.renderChats(window._userEmail);
    },

    async renamePrompt(id, old) {
        const t = prompt('Rename:', old);
        if (t) {
            await SupabaseOps.renameChat(id, t);
            await UIManager.renderChats(window._userEmail);
            $('chatTitle').textContent = t;
        }
    },

    async clearCurrentChat() {
        if (!chatId || !confirm('Clear?')) return;
        $('chatContainer').innerHTML = '<div class="welcome"><div class="welcome-icon">🧠</div><h2>Cleared</h2></div>';
    },

    async exportChat() {
        const msgs = await SupabaseOps.loadMessages(chatId);
        if (!msgs.length) return Utils.toast('Nothing to export');
        const txt = 'Zakhourani AI Export\n\n' + msgs.map(m => `[${m.role}] ${m.content}`).join('\n\n');
        const blob = new Blob([txt]);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'zakhourani-chat.txt';
        a.click();
        Utils.toast('📥 Exported');
    },

    copyMessage(btn) {
        const text = btn.closest('.message').textContent.replace(/Zakhourani AI|Copy|Speak/g, '').trim();
        navigator.clipboard.writeText(text).then(() => Utils.toast('📋 Copied!', 1500));
    },

    speakMessage(btn) {
        const text = btn.closest('.message').textContent.replace(/Zakhourani AI|Copy|Speak/g, '').trim();
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
    },

    async editLastMessage() {
        const msgs = await SupabaseOps.loadMessages(chatId);
        if (!msgs.length) return Utils.toast('No messages');
        let idx = -1;
        for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === 'user') { idx = i; break; }
        }
        if (idx === -1) return Utils.toast('No user message');
        const t = prompt('Edit:', msgs[idx].content);
        if (t) msgs[idx].content = t;
    },

    async activateFreeTier(userEmail) {
        if (!userEmail) return Utils.toast('Login first');
        AudioSystem.claim();
        const btn = $('freeTierBtn');
        btn.disabled = true;
        btn.textContent = 'Activating...';
        const limit = await SupabaseOps.checkLimit(userEmail);
        if (limit.remaining > 0) {
            $('freeTierCard').style.display = 'none';
            freeTierClaimed = true;
            await UIManager.updateUsageUI(userEmail);
            Utils.toast('🎉 ' + limit.remaining + ' questions available!');
            AudioSystem.success();
        } else {
            btn.textContent = '0 questions — resets at midnight';
            Utils.toast('Used all questions');
        }
    },

    async updateProfile(userEmail) {
        const name = $('profileName').value.trim();
        if (name) {
            await ZAI_SUPABASE.from('users').update({ display_name: name }).eq('email', userEmail);
            $('userName').textContent = name;
            Utils.toast('✅ Updated');
        }
        Utils.closeModal('profileModal');
    },

    async purchasePackage(userEmail, pkgId) {
        const data = await SupabaseOps.purchasePackage(userEmail, pkgId);
        Utils.toast(data.message);
        Utils.closeModal('packagesModal');
        await UIManager.updateUsageUI(userEmail);
    },

    async topupBalance(userEmail, amount) {
        const data = await SupabaseOps.topupBalance(userEmail, amount);
        Utils.toast('+$' + amount + ' Balance: $' + data.new_balance);
        Utils.closeModal('packagesModal');
        await UIManager.updateUsageUI(userEmail);
    }
};
