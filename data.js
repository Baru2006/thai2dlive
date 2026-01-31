const API_LIVE = 'https://api.thaistock2d.com/live';
async function fetchLive() {
    try {
        const response = await fetch(`${API_LIVE}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (err) {
        console.warn('Live Fetch Error:', err.message);
        return null;
    }
}

