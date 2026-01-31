const ui = {
    insightApi: "https://sheetdb.io/api/v1/n0wlxdgwqueub",

    init() {
        this.updateMain();
        this.updateInsights();
        
        // Orchestrate update loops
        setInterval(() => this.updateMain(), 2000);
        setInterval(() => this.updateInsights(), 8000);
    },

    async updateMain() {
        const rawData = await fetchLive();
        const state = deriveState(rawData);

        const statusEl = document.getElementById('status');
        if (state.error) {
            statusEl.textContent = state.error;
            statusEl.classList.remove('live');
            return;
        }

        // Main Display
        let d1 = '--', d2 = '--';
        if (state.large2D.length === 2) {
            d1 = state.large2D[0];
            d2 = state.large2D[1];
        }

        document.getElementById('digit1').textContent = d1;
        document.getElementById('digit2').textContent = d2;
        document.getElementById('set').textContent = state.setValue;
        document.getElementById('value').textContent = state.marketValue;

        statusEl.textContent = state.largeStatus;
        if (state.largeStatus === 'LIVE') {
            statusEl.classList.add('live');
        } else {
            statusEl.classList.remove('live');
        }

        // Sessions
        state.sessions.forEach((ses, i) => {
            const el = document.getElementById('session' + (i + 1));
            if (el) {
                el.textContent = ses.number;
                el.className = 'number ' + ses.status;
            }
        });
    },

    async updateInsights() {
        try {
            const res = await fetch(this.insightApi);
            const data = await res.json();
            if (!data) return;

            this.smoothUpdate("mod930", data[0]?.Modern);
            this.smoothUpdate("int930", data[0]?.Internet);
            this.smoothUpdate("mod1400", data[1]?.Modern);
            this.smoothUpdate("int1400", data[1]?.Internet);
        } catch (err) {
            console.warn("Insight sync failed");
        }
    },

    smoothUpdate(id, value) {
        const el = document.getElementById(id);
        const nextVal = value || "--";
        if (el && el.textContent !== nextVal) {
            el.style.opacity = "0.3";
            setTimeout(() => {
                el.textContent = nextVal;
                el.style.opacity = "1";
            }, 300);
        }
    }
};

