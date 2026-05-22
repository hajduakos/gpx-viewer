function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function smoothPoints(points, windowSize) {
    if (windowSize <= 0) return points;
    const half = Math.floor(windowSize / 2);
    return points.map((p, i) => {
        const start = Math.max(0, i - half);
        const end = Math.min(points.length - 1, i + half);
        let lat = 0, lon = 0, ele = 0, eleCount = 0;
        for (let j = start; j <= end; j++) {
            lat += points[j].lat;
            lon += points[j].lon;
            if (points[j].ele != null) { ele += points[j].ele; eleCount++; }
        }
        const n = end - start + 1;
        return { lat: lat / n, lon: lon / n, ele: eleCount > 0 ? ele / eleCount : p.ele, time: p.time };
    });
}

function parseGPXPoints(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const points = [];
    for (const tp of doc.querySelectorAll('trkpt')) {
        const eleEl = tp.querySelector('ele');
        const timeEl = tp.querySelector('time');
        points.push({
            lat: +tp.getAttribute('lat'),
            lon: +tp.getAttribute('lon'),
            ele: eleEl ? +eleEl.textContent : null,
            time: timeEl ? new Date(timeEl.textContent) : null,
        });
    }
    const trk = doc.querySelector('trk');
    const name = (trk?.querySelector('name') || doc.querySelector('metadata > name'))?.textContent || 'Unnamed';
    const type = trk?.querySelector('type')?.textContent || 'Unknown';
    return { points, name, type };
}

function formatDuration(sec) {
    if (!sec || sec <= 0) return '—';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

function formatDate(d) {
    if (!d) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
