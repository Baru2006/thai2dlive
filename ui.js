const ui = {
    init() {
        this.update();
        // Poll every 2 seconds only when needed (always for simplicity)
        this.interval = setInterval(() => this.update(), 2000);

        // Source toggle (label only)
        document.getElementById('toggle-btn').addEventListener('click', () => {
            const btn = document.getElementById('toggle-btn');
            btn.textContent = btn.textContent === 'Modern' ? 'Internet' : 'Modern';
        });
    },

    async update() {
        const rawData = await fetchLive();
        const state = deriveState(rawData);

        // Connection error handling
        if (state.error) {
            document.getElementById('status').textContent = state.error;
            return;
        }

        // Large 2D digits
        let d1 = '--';
        let d2 = '--';
        if (state.largeStatus === 'VERIFYING') {
            document.getElementById('status').textContent = 'VERIFYING...';
        } else if (state.large2D.length === 2) {
            d1 = state.large2D[0];
            d2 = state.large2D[1];
            document.getElementById('status').textContent = state.largeStatus;
        } else {
            document.getElementById('status').textContent = state.largeStatus || 'CLOSED';
        }
        document.getElementById('digit1').textContent = d1;
        document.getElementById('digit2').textContent = d2;

        // Status styling
        const statusEl = document.getElementById('status');
        statusEl.className = 'status ' + state.largeStatus.toLowerCase();

        // Transparency
        document.getElementById('set').textContent = state.setValue;
        document.getElementById('value').textContent = state.marketValue;

        // Session blocks
        state.sessions.forEach((ses, i) => {
            const el = document.getElementById('session' + (i + 1));
            el.textContent = ses.number;
            el.className = 'number ' + ses.status.toLowerCase();
        });
    }
};
