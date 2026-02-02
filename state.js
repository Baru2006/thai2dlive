// Canonical deterministic 2D extraction (no rounding after formatting)
function compute2D(setStr, valueStr) {
    if (setStr === '--' || valueStr === '--') return '--';
    const setFixed = parseFloat(setStr).toFixed(2);
    const valueFixed = parseFloat(valueStr).toFixed(2);
    const setSecond = setFixed.charAt(setFixed.indexOf('.') + 2) || '0';
    const valueSecond = valueFixed.charAt(valueFixed.indexOf('.') + 2) || '0';
    return setSecond + valueSecond;
}

// Convert server time (Thai ICT) to MMT minutes for session logic
function getMmtMinutes(serverTimeStr) {
    const [_, timePart] = serverTimeStr.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    m -= 30;
    if (m < 0) {
        m += 60;
        h -= 1;
        if (h < 0) h = 23;
    }
    return h * 60 + m;
}

// Evening verification period in MMT
function isEveningVerify(mmtMinutes) {
    const start = 16 * 60 + 10;
    const end = 16 * 60 + 40;
    return mmtMinutes >= start && mmtMinutes < end;
}

// Derive all UI state from server data only
function deriveState(rawData) {
    if (!rawData) return { error: 'CONNECTION ERROR' };

    const live = rawData.live || {};
    const result = rawData.result || [];
    const serverTime = rawData.server_time || '';

    const current2D = compute2D(live.set || '--', live.value || '--');
    const isLive = current2D !== '--';

    const mmtMinutes = getMmtMinutes(serverTime);
    const inVerify = isEveningVerify(mmtMinutes);

    // Large display logic (strictly server-driven)
    let large2D = '--';
    let largeStatus = '';
    if (isLive) {
        large2D = current2D;
        largeStatus = 'LIVE';
    } else if (inVerify && result.length === 3) {
        large2D = 'VERIFYING...';
        largeStatus = 'VERIFYING';
    } else if (result.length > 0) {
        large2D = result[result.length - 1].twod;
        largeStatus = 'LOCKED';
    } else {
        largeStatus = 'CLOSED';
    }

    // Session blocks (4 fixed sessions)
    const sessions = [
        { label: '11:00 AM', number: '--', status: '' },
        { label: '12:01 PM', number: '--', status: '' },
        { label: '3:00 PM', number: '--', status: '' },
        { label: '4:30 PM', number: '--', status: '' }
    ];

    // Fill locked results
    result.slice(0, 4).forEach((res, i) => {
        sessions[i].number = res.twod;
        sessions[i].status = 'LOCKED';
    });

    // Overlay current live or verifying on the active session
    const activeIndex = result.length;
    if (isLive && activeIndex < 4) {
        sessions[activeIndex].number = current2D;
        sessions[activeIndex].status = 'LIVE';
    } else if (inVerify && result.length === 3) {
        sessions[3].number = 'VERIFYING...';
        sessions[3].status = 'VERIFYING';
    }

    return {
        large2D,
        largeStatus,
        setValue: live.set || '--',
        marketValue: live.value || '--',
        sessions
    };
}
