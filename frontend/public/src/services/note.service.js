const NoteService = {
    baseUrl: '/api/notes',

    _getHeaders() {
        const token = localStorage.getItem('aura_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    async createNote(data) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Failed to create note.' };
        }
    },

    async getLecturerNotes() {
        try {
            const response = await fetch(`${this.baseUrl}/mine`, { headers: this._getHeaders() });
            return await response.json();
        } catch {
            return { success: false, data: [] };
        }
    },

    async getClassNotes(classId) {
        try {
            const response = await fetch(`${this.baseUrl}/class/${classId}`, { headers: this._getHeaders() });
            return await response.json();
        } catch {
            return { success: false, data: [] };
        }
    },

    async getUnreadCount() {
        try {
            const response = await fetch(`${this.baseUrl}/announcements/unread`, { headers: this._getHeaders() });
            return await response.json();
        } catch {
            return { success: false, count: 0 };
        }
    },

    async getUnreadPreview() {
        try {
            const response = await fetch(`${this.baseUrl}/announcements/unread/preview`, { headers: this._getHeaders() });
            return await response.json();
        } catch {
            return { success: false, data: [] };
        }
    },

    async markRead(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/mark-read`, {
                method: 'POST',
                headers: this._getHeaders()
            });
            return await response.json();
        } catch {
            return { success: false };
        }
    },

    async uploadFile(file, onProgress) {
        const token = localStorage.getItem('aura_token');
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            const fd  = new FormData();
            fd.append('file', file);
            if (onProgress) xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
            xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({ success: false, message: 'Invalid response.' }); } };
            xhr.onerror = () => resolve({ success: false, message: 'Upload failed.' });
            xhr.open('POST', '/api/notes/upload');
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(fd);
        });
    },

    async downloadNote(id) {
        try {
            const response = await fetch(`${this.baseUrl}/files/${id}/download`, { headers: this._getHeaders() });
            if (!response.ok) return;
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const cd    = response.headers.get('Content-Disposition') || '';
            const match = cd.match(/filename="([^"]+)"/);
            const name  = match ? match[1] : 'note.txt';
            const a     = document.createElement('a');
            a.href      = blobUrl;
            a.download  = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch {}
    },

    async updateNote(id, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: this._getHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Failed to update note.' };
        }
    },

    async deleteNote(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: this._getHeaders()
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Failed to delete note.' };
        }
    }
};
