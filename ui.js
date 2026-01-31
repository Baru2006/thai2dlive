const ui = {
    insightApi: "https://sheetdb.io/api/v1/n0wlxdgwqueub",

    init() {
        this.updateMain();
        this.updateInsights();
        this.startMSTClock();
        
        // Orchestrate update loops
        setInterval(() => this.updateMain(), 2000);
        setInterval(() => this.updateInsights(), 8000);
    },

    /**
     * Updates the Myanmar Standard Time (MST) display.
     * Calculated as UTC + 6:30.
     */
    startMSTClock() {
        const updateClock = () => {
            const now = new Date();
            // Get UTC time and add 6.5 hours (6h 30m)
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const mstDate = new Date(utc + (3600000 * 6.5));

            const hours = mstDate.getHours();
            const minutes = mstDate.getMinutes();
            const seconds = mstDate.getSeconds();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;

            const timeString = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
            
            const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
            const dateString = mstDate.toLocaleDateString('en-US', options).replace(/,/g, '');

            const timeEl = document.getElementById('mst-time');
            const dateEl = document.getElementById('mst-date');
            
            if (timeEl) timeEl.textContent = timeString;
            if (dateEl) dateEl.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
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

                               
