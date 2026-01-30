const API_LIVE = 'https://api.thaistock2d.com/live';

async function fetchLive() {
    try {
        // Cache-busting timestamp
        const response = await fetch(`${API_LIVE}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Fetch error:', err);
        return null;
    }
}
