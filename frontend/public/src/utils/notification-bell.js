(function () {
    let _bellInterval = null;

    function _escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async function _loadBellCount() {
        try {
            const token = localStorage.getItem('aura_token');
            if (!token) return;
            const r    = await fetch('/api/notes/announcements/unread', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await r.json();
            if (!data.success) return;
            const badge = document.getElementById('bell-badge');
            if (!badge) return;
            if (data.count > 0) {
                badge.textContent = data.count > 9 ? '9+' : String(data.count);
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch {}
    }

    async function _loadBellPreview() {
        const dropdown = document.getElementById('bell-dropdown');
        if (!dropdown) return;
        dropdown.innerHTML = '<div class="p-4 text-sm text-center" style="color:#8A8A8A;">Loading...</div>';
        try {
            const token = localStorage.getItem('aura_token');
            const r     = await fetch('/api/notes/announcements/unread/preview', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data  = await r.json();
            if (!data.success || !data.data.length) {
                dropdown.innerHTML = '<div class="p-4 text-sm text-center" style="color:#8A8A8A;">No new announcements.</div>';
                return;
            }
            dropdown.innerHTML = `
                <div class="p-3" style="border-bottom:1px solid #E5E1DA;">
                    <p class="text-xs font-bold uppercase tracking-widest" style="color:#8A8A8A;">New Announcements</p>
                </div>
                <div>
                    ${data.data.map(n => `
                        <div class="p-3 cursor-pointer" style="border-bottom:1px solid #E5E1DA;" onclick="bellMarkRead('${n._id}', this)"
                             onmouseover="this.style.background='#F8F7F4'" onmouseout="this.style.background='#fff'">
                            <p class="text-sm font-semibold" style="color:#111111;">${_escHtml(n.title)}</p>
                            <p class="text-xs mt-0.5" style="color:#525252;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${_escHtml(n.body)}</p>
                            <p class="text-[10px] mt-1" style="color:#8A8A8A;">${new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="p-3 text-center">
                    <a href="/src/views/student-notes.html" class="text-xs font-bold" style="color:#1D3461;">View all notes →</a>
                </div>
            `;
        } catch {
            dropdown.innerHTML = '<div class="p-4 text-sm text-center" style="color:#8A8A8A;">Failed to load.</div>';
        }
    }

    window.toggleBellDropdown = async function () {
        const dropdown = document.getElementById('bell-dropdown');
        if (!dropdown) return;
        if (!dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
            return;
        }
        await _loadBellPreview();
        dropdown.classList.remove('hidden');
    };

    window.bellMarkRead = async function (noteId, el) {
        try {
            const token = localStorage.getItem('aura_token');
            await fetch(`/api/notes/${noteId}/mark-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (el) { el.style.opacity = '0.45'; el.style.pointerEvents = 'none'; }
            await _loadBellCount();
        } catch {}
    };

    window.initNotificationBell = function () {
        _loadBellCount();
        _bellInterval = setInterval(_loadBellCount, 60000);

        document.addEventListener('click', function (e) {
            const dropdown = document.getElementById('bell-dropdown');
            const btn      = document.getElementById('bell-btn');
            if (!dropdown || dropdown.classList.contains('hidden')) return;
            if (!dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    };
})();
