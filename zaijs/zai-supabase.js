// ============================================================
// ZAKHOURANI AI - SUPABASE OPERATIONS
// ============================================================
const ZAI_SUPABASE = supabase.createClient(ZAI_CONFIG.supabaseUrl, ZAI_CONFIG.supabaseAnonKey);

const SupabaseOps = {
    async checkLimit(email) {
        try {
            const { data } = await ZAI_SUPABASE.rpc('check_daily_limit', { p_user_email: email });
            return data || { can_ask: true, remaining: 50, total: 50, username: 'User', balance: 0 };
        } catch (e) {
            return { can_ask: true, remaining: 50, total: 50, username: 'User', balance: 0 };
        }
    },

    async incrementUsage(email) {
        try { await ZAI_SUPABASE.rpc('increment_usage', { p_user_email: email }); } catch (e) {}
    },

    async getUser(email, name) {
        let { data } = await ZAI_SUPABASE.from('users').select('*').eq('email', email).maybeSingle();
        if (!data) {
            await ZAI_SUPABASE.from('users').insert({
                email, username: name, display_name: name,
                daily_questions_used: 0,
                daily_questions_date: new Date().toISOString().split('T')[0],
                total_questions_used: 0, balance_credits: 0, is_premium: false
            });
            return this.getUser(email, name);
        }
        return data;
    },

    async loadChats(userId) {
        const { data } = await ZAI_SUPABASE.from('conversations')
            .select('*').eq('user_id', userId).order('updated_at', { ascending: false });
        return data || [];
    },

    async createChat(userId, title) {
        const { data } = await ZAI_SUPABASE.from('conversations')
            .insert({ user_id: userId, title }).select().single();
        return data;
    },

    async deleteChat(id) {
        if (id && id.length > 25) await ZAI_SUPABASE.from('conversations').delete().eq('id', id);
    },

    async renameChat(id, title) {
        if (id && id.length > 25) await ZAI_SUPABASE.from('conversations')
            .update({ title, updated_at: new Date().toISOString() }).eq('id', id);
    },

    async loadMessages(convId) {
        if (!convId || convId.length < 25) return [];
        const { data } = await ZAI_SUPABASE.from('messages')
            .select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
        return data || [];
    },

    async saveMessage(convId, userId, role, content, engine) {
        if (!convId || convId.length < 25) return;
        await ZAI_SUPABASE.from('messages').insert({
            conversation_id: convId, user_id: userId, role, content,
            engine: engine || 'Zakhourani AI'
        });
    },

    async loadPackages() {
        const { data } = await ZAI_SUPABASE.from('packages').select('*').order('price', { ascending: true });
        return data || [];
    },

    async purchasePackage(email, pkgId) {
        const { data } = await ZAI_SUPABASE.rpc('purchase_package', { p_user_email: email, p_pkg_id: pkgId });
        return data;
    },

    async topupBalance(email, amount) {
        const { data } = await ZAI_SUPABASE.rpc('topup_balance', { p_user_email: email, p_amount: amount });
        return data;
    }
};
