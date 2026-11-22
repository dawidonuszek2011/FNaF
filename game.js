'use strict';

// Rooms are kept in one place so the map, camera list and future animatronic AI
// can all use the same room IDs.
const ROOMS = {
  main: { id: 'main', cam: 'CAM 01', name: 'MAIN AREA', description: 'Główna część lokalu. Widać stąd wejście na scenę.', art: 'stage' },
  backstage: { id: 'backstage', cam: 'CAM 02', name: 'BACKSTAGE', description: 'Zaplecze za sceną. Pomieszczenie jest oddzielone przegrodą.', art: 'backstage' },
  entrance: { id: 'entrance', cam: 'CAM 03', name: 'ENTRANCE', description: 'Główne wejście do lokalu. Duże drzwi znajdują się po prawej stronie.', art: 'entrance' },
  arcade: { id: 'arcade', cam: 'CAM 04', name: 'ARCADE', description: 'Sala automatów, położona nad Entrance.', art: 'arcade' },
  kitchen: { id: 'kitchen', cam: 'CAM 05', name: 'KITCHEN', description: 'Kuchnia, położona nad Arcade.', art: 'kitchen' },
  hall: { id: 'hall', cam: 'CAM 06', name: 'HALL', description: 'Korytarz po lewej stronie lokalu.', art: 'hall' },
  parts: { id: 'parts', cam: 'CAM 07', name: 'PARTS & SERVICE', description: 'Pomieszczenie techniczne dostępne z górnego korytarza.', art: 'parts' },
  office: { id: 'office', cam: '—', name: 'OFFICE', description: 'Biuro ochroniarza. Twoja aktualna lokacja.', art: 'office' }
};

const screens = {
  menu: document.getElementById('menu-screen'),
  office: document.getElementById('office-screen'),
  cameras: document.getElementById('camera-screen'),
  end: document.getElementById('end-screen')
};

const state = {
  running: false,
  monitorOpen: false,
  selectedRoom: 'main',
  startedAt: 0,
  lastTickAt: 0,
  elapsedBeforePause: 0,
  power: 100,
  leftLight: false,
  rightLight: false,
  nightDurationMs: 6 * 60 * 1000,
  tickId: null
};

const $ = (id) => document.getElementById(id);

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle('hidden', key !== name);
  });
}

function startNight() {
  stopTimer();
  state.running = true;
  state.monitorOpen = false;
  state.selectedRoom = 'main';
  state.startedAt = Date.now();
  state.lastTickAt = state.startedAt;
  state.elapsedBeforePause = 0;
  state.power = 100;
  state.leftLight = false;
  state.rightLight = false;
  $('left-light').classList.remove('active');
  $('right-light').classList.remove('active');
  renderPower();
  selectCamera('main');
  showScreen('office');
  state.tickId = window.setInterval(updateNight, 250);
}

function stopTimer() {
  if (state.tickId !== null) {
    window.clearInterval(state.tickId);
    state.tickId = null;
  }
}

function elapsedMs() {
  return state.elapsedBeforePause + (state.running ? Date.now() - state.startedAt : 0);
}

function updateNight() {
  if (!state.running) return;
  const now = Date.now();
  const elapsed = elapsedMs();
  const progress = Math.min(1, elapsed / state.nightDurationMs);
  const hourIndex = Math.min(6, Math.floor(progress * 6));
  $('clock').textContent = hourIndex === 0 ? '12 AM' : `${hourIndex} AM`;
  $('camera-clock').textContent = $('clock').textContent;

  // Energy is deducted only for the time each device has actually been active.
  const deltaMinutes = Math.max(0, now - state.lastTickAt) / 60000;
  const baseDrainPerMinute = 100 / 6;
  const extraDrainPerMinute = (state.monitorOpen ? 2.2 : 0)
    + (state.leftLight ? 1.3 : 0)
    + (state.rightLight ? 1.3 : 0);
  state.power = Math.max(0, state.power - deltaMinutes * (baseDrainPerMinute + extraDrainPerMinute));
  state.lastTickAt = now;
  renderPower();

  if (progress >= 1) finishNight(true);
  else if (state.power <= 0) finishNight(false);
}

function renderPower() {
  $('power').textContent = `POWER ${Math.ceil(state.power)}%`;
  const bars = Math.max(1, Math.ceil(state.power / 25));
  $('usage').textContent = `USAGE ${'▮'.repeat(bars)}`;
  $('power').style.color = state.power < 20 ? '#f36a55' : '#a7d7a6';
}

function finishNight(won) {
  state.running = false;
  state.monitorOpen = false;
  stopTimer();
  $('end-title').textContent = won ? '6 AM' : 'POWER OUT';
  $('end-message').textContent = won
    ? 'Dotrwałeś do końca nocy. To dopiero początek.'
    : 'Zabrakło energii. Ta noc nie została ukończona.';
  showScreen('end');
}

function openMonitor() {
  if (!state.running || state.monitorOpen) return;
  state.monitorOpen = true;
  showScreen('cameras');
  updateNight();
}

function closeMonitor() {
  if (!state.running || !state.monitorOpen) return;
  state.monitorOpen = false;
  showScreen('office');
  updateNight();
}

function selectCamera(roomId) {
  const room = ROOMS[roomId];
  if (!room || roomId === 'office') return;
  state.selectedRoom = roomId;
  $('camera-id').textContent = room.cam;
  $('feed-room-name').textContent = room.name;
  $('camera-description').textContent = room.description;
  $('feed-room-art').className = `feed-room-art room-art-${room.art}`;

  document.querySelectorAll('.cam-choice').forEach((button) => {
    button.classList.toggle('active', button.dataset.room === roomId);
  });
  document.querySelectorAll('.map-room').forEach((element) => {
    element.classList.toggle('selected', element.dataset.room === roomId);
  });
}

function toggleLight(side) {
  if (!state.running || state.monitorOpen) return;
  const key = side === 'left' ? 'leftLight' : 'rightLight';
  state[key] = !state[key];
  $(`${side}-light`).classList.toggle('active', state[key]);
  updateNight();
}

$('start-button').addEventListener('click', startNight);
$('monitor-button').addEventListener('click', openMonitor);
$('close-monitor').addEventListener('click', closeMonitor);
$('left-light').addEventListener('click', () => toggleLight('left'));
$('right-light').addEventListener('click', () => toggleLight('right'));
$('back-to-menu').addEventListener('click', () => {
  stopTimer();
  state.running = false;
  showScreen('menu');
});

document.querySelectorAll('.cam-choice').forEach((button) => {
  button.addEventListener('click', () => selectCamera(button.dataset.room));
});
document.querySelectorAll('.map-room').forEach((roomElement) => {
  roomElement.addEventListener('click', () => {
    const roomId = roomElement.dataset.room;
    if (roomId && roomId !== 'office' && state.monitorOpen) selectCamera(roomId);
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'm') {
    if (state.monitorOpen) closeMonitor();
    else openMonitor();
  }
  if (event.key === 'Escape' && state.monitorOpen) closeMonitor();
});

// Start on the title screen. The night timer begins only after pressing Start.
showScreen('menu');
