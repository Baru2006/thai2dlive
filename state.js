
function compute2D(setStr, valueStr) {
    if (!setStr || !valueStr || setStr === '--' || valueStr === '--') return '--';
    const setFixed = parseFloat(setStr).toFixed(2);
    const valueFixed = parseFloat(valueStr).toFixed(2);
    const setSecond = setFixed.charAt(setFixed.indexOf('.') + 2) || '0';
    const valueSecond = valueFixed.charAt(valueFixed.indexOf('.') + 2) || '0';
    return setSecond + valueSecond;
}

/**
 * Normalizes server time to local session minutes.
 */
function getMmtMinutes(serverTimeStr) {
    if (!serverTimeStr) return 0;
    const [_, timePart] = serverTimeStr.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    // Offset for local session tracking logic if needed
    m -= 30;
    if (m < 0) {
        m += 60;
        h -= 1;
        if (h < 0) h = 23;
    }
    return h * 60 + m;
}

function isEveningVerify(mmtMinutes) {
    const start = 16 * 60 + 10;
    const end = 16 * 60 + 40;
    return mmtMinutes >= start && mmtMinutes < end;
}

/**
 * Transforms raw API response into a clean UI state object.
 */
function transformState(apiData) {
    if (!apiData) return null;

    const live = apiData.live || {};
    const result = apiData.result || [];
    const serverTime = apiData.server_time || '';

    const current2D = compute2D(live.set || '--', live.value || '--');
    const isLive = current2D !== '--';

    const mmtMinutes = getMmtMinutes(serverTime);
    const inVerify = isEveningVerify(mmtMinutes);

    let large2D = '--';
    let largeStatus = '';
    
    if (isLive) {
        large2D = current2D;
        largeStatus = 'LIVE';
    } else if (inVerify && result.length === 3) {
        large2D = '...';
        largeStatus = 'VERIFYING';
    } else if (result.length > 0) {
        large2D = result[result.length - 1].twod;
        largeStatus = 'CLOSED';
    } else {
        largeStatus = 'CLOSED';
    }

    const sessions = [
        { label: '11:00 AM', number: '--', status: '' },
        { label: '12:01 PM', number: '--', status: '' },
        { label: '3:00 PM', number: '--', status: '' },
        { label: '4:30 PM', number: '--', status: '' }
    ];

    result.slice(0, 4).forEach((res, i) => {
        sessions[i].number = res.twod;
        sessions[i].status = 'locked';
    });

    const activeIndex = result.length;
    if (isLive && activeIndex < 4) {
        sessions[activeIndex].number = current2D;
        sessions[activeIndex].status = 'live';
    } else if (inVerify && result.length === 3) {
        sessions[3].number = '...';
        sessions[3].status = 'verifying';
    }

    return {
        large2D,
        largeStatus,
        marketSet: live.set || '--',
        marketValue: live.value || '--',
        sessions
    };
        }
