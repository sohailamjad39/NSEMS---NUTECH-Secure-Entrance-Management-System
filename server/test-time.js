const { getTimeWindow, isWithinTimeWindow, getDeviceTimeFromQR } = require('./utils/time');

const window = getTimeWindow();
console.log('Current window:', window.start, 'to', window.end);

// Simulate QR payload: { t: current_time_in_seconds }
const nowSec = Math.floor(Date.now() / 1000);
const qrPayload = Buffer.from(JSON.stringify({ t: nowSec })).toString('base64');
const deviceTime = getDeviceTimeFromQR(qrPayload);

console.log('Device time from QR:', deviceTime);
console.log('Valid?', isWithinTimeWindow(deviceTime, window.start, window.end));