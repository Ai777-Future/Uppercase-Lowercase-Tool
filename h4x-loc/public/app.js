// ====== UTIL ======
const $ = (sel) => document.querySelector(sel);
const randId = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const statusBar = (msg) => $("#statusBar").textContent = `Status: ${msg}`;

const socket = io();
// map init
const map = L.map('map', { zoomControl: true, attributionControl: false }).setView([28.6139, 77.2090], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map);
let marker, path;

// UI elements
const sharerPanel = $("#sharerPanel");
const viewerPanel = $("#viewerPanel");
const btnSharer = $("#btnSharer");
const btnViewer = $("#btnViewer");
const roomSharer = $("#roomSharer");
const roomViewer = $("#roomViewer");
const copySharer = $("#copySharer");
const qrSharer = $("#qrSharer");
const startShare = $("#startShare");
const stopShare = $("#stopShare");
const qrCanvas = $("#qrCanvas");

let currentRoom = null;
let watchId = null;

// ====== MODE SWITCH ======
btnSharer.addEventListener('click', () => {
  sharerPanel.classList.remove('hidden');
  viewerPanel.classList.add('hidden');
  if (!roomSharer.value) roomSharer.value = randId();
});
btnViewer.addEventListener('click', () => {
  viewerPanel.classList.remove('hidden');
  sharerPanel.classList.add('hidden');
});

// ====== ROOM JOIN ======
function joinRoom(roomId){
  currentRoom = roomId;
  socket.emit('join-room', roomId);
  statusBar(`joined room ${roomId}`);
}
socket.on('joined', (room) => {
  console.log('Joined room', room);
});

// ====== SHARING (CONSENT-BASED) ======
startShare.addEventListener('click', async () => {
  const roomId = roomSharer.value.trim() || randId();
  roomSharer.value = roomId;
  joinRoom(roomId);

  if (!('geolocation' in navigator)) {
    statusBar('Geolocation not supported');
    return;
  }

  if (path) { map.removeLayer(path); }
  path = L.polyline([], { color: '#39ff14', weight: 4, opacity: 0.8 }).addTo(map);

  statusBar('Requesting location permission…');
  watchId = navigator.geolocation.watchPosition((pos) => {
    const { latitude, longitude, accuracy, heading, speed } = pos.coords;
    const coords = { lat: latitude, lng: longitude, accuracy, heading, speed, ts: Date.now() };

    if (!marker){
      marker = L.marker([coords.lat, coords.lng]).addTo(map);
      map.setView([coords.lat, coords.lng], 16);
    } else {
      marker.setLatLng([coords.lat, coords.lng]);
    }
    path.addLatLng([coords.lat, coords.lng]);

    socket.emit('live-location', { roomId, coords });
    statusBar(`sharing @ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (±${Math.round(accuracy)}m)`);
  }, (err) => {
    statusBar(`error: ${err.message}`);
  }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
});

stopShare.addEventListener('click', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  socket.emit('stop-stream', currentRoom);
  statusBar('sharing stopped');
});

// ====== VIEWING ======
$("#joinViewer").addEventListener('click', () => {
  const roomId = roomViewer.value.trim();
  if (!roomId) return alert('Enter Room ID');
  joinRoom(roomId);
  statusBar('waiting for live signal…');
});

socket.on('live-location', (coords) => {
  if (!marker){
    marker = L.marker([coords.lat, coords.lng]).addTo(map);
    path = L.polyline([[coords.lat, coords.lng]], { color:'#39ff14', weight:4, opacity:0.8 }).addTo(map);
    map.setView([coords.lat, coords.lng], 16);
  } else {
    marker.setLatLng([coords.lat, coords.lng]);
    path.addLatLng([coords.lat, coords.lng]);
  }
  statusBar(`tracking @ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
});

socket.on('stop-stream', () => {
  statusBar('sharer stopped the stream');
});

// ====== SHARING HELPERS ======
copySharer.addEventListener('click', async () => {
  const id = roomSharer.value.trim();
  const url = `${location.origin}${location.pathname}?room=${id}`;
  await navigator.clipboard.writeText(url);
  statusBar('viewer link copied to clipboard');
});

qrSharer.addEventListener('click', () => {
  const id = roomSharer.value.trim();
  const url = `${location.origin}${location.pathname}?room=${id}`;
  drawQR(url);
  qrCanvas.classList.toggle('hidden');
});

// Basic tiny QR (placeholder). Replace with a real QR lib for production.
function drawQR(text){
  const ctx = qrCanvas.getContext('2d');
  ctx.fillStyle = '#0a120d'; ctx.fillRect(0,0,qrCanvas.width,qrCanvas.height);
  let seed = 0; for (let i=0;i<text.length;i++) seed = (seed*31 + text.charCodeAt(i)) & 0xffffffff;
  const size = 32; const cell = qrCanvas.width / size;
  for (let y=0;y<size;y++){
    for (let x=0;x<size;x++){
      seed = (seed ^ (seed << 13)) >>> 0; seed = (seed ^ (seed >> 17)) >>> 0; seed = (seed ^ (seed << 5)) >>> 0;
      const on = ((seed + x*y + x + y) & 7) < 3;
      ctx.fillStyle = on ? '#39ff14' : '#0a120d';
      ctx.fillRect(x*cell, y*cell, cell-1, cell-1);
    }
  }
}

// ====== URL auto-join ======
(function autoJoinFromQuery(){
  const params = new URLSearchParams(location.search);
  const room = params.get('room');
  if (room){
    btnViewer.click();
    roomViewer.value = room;
    $("#joinViewer").click();
  }
})();
