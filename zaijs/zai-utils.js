// ============================================================
// ZAKHOURANI AI - UTILITY FUNCTIONS
// ============================================================
const $ = (id) => document.getElementById(id);

const Utils = {
    toast(message, duration = 2500) {
        const t = $('toast');
        t.textContent = message;
        t.style.display = 'block';
        clearTimeout(t._timeout);
        t._timeout = setTimeout(() => t.style.display = 'none', duration);
    },

    getTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    isValidUUID(str) {
        return str && str.length > 25 && /^[0-9a-f-]+$/i.test(str);
    },

    formatText(text) {
        let html = text;
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/```([\s\S]*?)```/g, (m, c) => `<pre><code>${c.trim().replace(/</g, '&lt;')}</code></pre>`);
        html = html.replace(/`([^`]+)`/g, (m, c) => `<code>${c.replace(/</g, '&lt;')}</code>`);
        html = html.replace(/\n/g, '<br>');
        return html;
    },

    toggleSidebar() {
        $('sidebar').classList.toggle('open');
        $('sidebarOverlay').classList.toggle('show');
    },

    closeModal(id) {
        $(id).classList.remove('show');
    },

    showModal(id) {
        $(id).classList.add('show');
    },

    updateMenuButton() {
        if (window.innerWidth < 1024) {
            $('menuBtn').style.display = 'flex';
        } else {
            $('menuBtn').style.display = 'none';
            $('sidebar').classList.remove('open');
            $('sidebarOverlay').classList.remove('show');
        }
    }
};

window.addEventListener('resize', Utils.updateMenuButton);
