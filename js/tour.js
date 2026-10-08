import { getPublicExhibits } from './governance.js';
import { $, $$, escapeHtml, renderInfo, setupCommon, showToast, stopSpeech } from './shared.js';
import { createMuseumScene } from './scene.js';

setupCommon();
const exhibits = getPublicExhibits();
$('.tour-top-left > span').textContent = `${String(exhibits.length).padStart(2, '0')} hiện vật đang hiển thị · Trải nghiệm tương tác`;
let selected = -1;
const info = $('#tour-info');
const rail = $('#tour-exhibits');
rail.innerHTML = exhibits.map((item, index) => `<button class="tour-item" type="button" data-index="${index}"><img src="${escapeHtml(item.image)}" alt=""><span>${escapeHtml(item.name)}<small>${escapeHtml(item.era)}</small></span></button>`).join('');

function select(id) {
  selected = exhibits.findIndex((entry) => entry.id === id);
  if (selected < 0) return;
  const item = exhibits[selected];
  stopSpeech();
  renderInfo(item, $('#tour-info-content'));
  info.hidden = false;
  $$('.tour-item').forEach((button) => button.classList.toggle('is-active', Number(button.dataset.index) === selected));
  $(`.tour-item[data-index="${selected}"]`)?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  museum?.setSelected(id);
}

let museum;
try { museum = createMuseumScene({ container: $('#tour-scene'), hotspotsContainer: $('#hotspots'), exhibits, onSelect: select }); }
catch (error) { console.error(error); showToast('Không thể khởi tạo cảnh 3D trên thiết bị này. Hãy mở Bộ sưu tập để xem hiện vật.'); }

rail.addEventListener('click', (event) => { const button = event.target.closest('[data-index]'); if (button) select(exhibits[Number(button.dataset.index)].id); });
$('#next-exhibit').addEventListener('click', () => { if (!exhibits.length) { showToast('Hiện chưa có hiện vật công khai.'); return; } select(exhibits[(selected + 1) % exhibits.length].id); });
$('#close-info').addEventListener('click', () => { stopSpeech(); info.hidden = true; museum?.setSelected(null); });
$('#help-button').addEventListener('click', () => $('#tour-guide').hidden = false);
$('#close-help').addEventListener('click', () => $('#tour-guide').hidden = true);
$('#start-tour').addEventListener('click', () => $('#tour-guide').hidden = true);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (!info.hidden) { stopSpeech(); info.hidden = true; } $('#tour-guide').hidden = true; } });

const vrButton = $('#vr-button');
const xrStatus = $('#xr-status');
if (navigator.xr?.isSessionSupported) {
  navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
    vrButton.hidden = !supported;
    xrStatus.textContent = supported ? 'Thiết bị hỗ trợ WebXR' : 'Chế độ web thường';
  }).catch(() => { xrStatus.textContent = 'Chế độ web thường'; });
} else xrStatus.textContent = 'Chế độ web thường';
vrButton.addEventListener('click', async () => {
  try { $('#tour-guide').hidden = true; const session = await museum.enterVR(); vrButton.textContent = 'Thoát VR'; session.addEventListener('end', () => { vrButton.innerHTML = '◉ <span>Vào VR</span>'; }); }
  catch (error) { showToast(error.message || 'Không thể bắt đầu phiên VR.'); }
});

const joystick = $('#joystick');
const thumb = $('.tour-joystick__thumb', joystick);
function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  const max = 33; const length = Math.max(1, Math.hypot(dx, dy));
  const x = length > max ? dx / length * max : dx;
  const y = length > max ? dy / length * max : dy;
  thumb.style.transform = `translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
  museum?.setJoystick(x / max, y / max);
}
joystick.addEventListener('pointerdown', (event) => { joystick.setPointerCapture(event.pointerId); updateJoystick(event); });
joystick.addEventListener('pointermove', (event) => { if (joystick.hasPointerCapture(event.pointerId)) updateJoystick(event); });
function releaseJoystick() { thumb.style.transform = 'translate(-50%,-50%)'; museum?.setJoystick(0, 0); }
joystick.addEventListener('pointerup', releaseJoystick);
joystick.addEventListener('pointercancel', releaseJoystick);
