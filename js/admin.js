import { getExhibits, saveExhibits, resetExhibits } from './data.js';
import { getStudioState, recordExhibitEdit, recordExhibitDelete, resetStudioState } from './governance.js';
import { $, $$, escapeHtml, showToast } from './shared.js';
import { setupMediaDemo } from './media-demo.js';

let exhibits = getExhibits();
getStudioState();
let editingId = null;
let search = '';
const form = $('#exhibit-form');
const backdrop = $('#edit-backdrop');
const labels = { overview: 'Tổng quan', exhibits: 'Hiện vật', rooms: 'Phòng trưng bày', media: 'Thư viện media' };
const mediaDemo = setupMediaDemo(() => exhibits);

function activeView() {
  const view = location.hash.slice(1) || 'overview';
  const name = labels[view] ? view : 'overview';
  $$('.admin-view').forEach((section) => section.hidden = section.id !== `view-${name}`);
  $$('.admin-side-nav a').forEach((link) => link.classList.toggle('is-active', link.dataset.adminView === name));
  $('#admin-breadcrumb').textContent = labels[name];
  if (name !== 'media') mediaDemo.stopSpeech();
}

function render() {
  exhibits.sort((a, b) => a.order - b.order);
  const count = String(exhibits.length).padStart(2, '0');
  $('#stat-exhibits').textContent = count;
  $('#sidebar-count').textContent = count;
  $('#exhibit-list-count').textContent = `${exhibits.length} hiện vật`;
  const studio = getStudioState();
  $('#overview-pending').textContent = Object.values(studio.records).filter((record) => !record.deleted && record.status === 'pending').length;
  $('#overview-reports').textContent = studio.reports.filter((report) => report.status === 'new').length;
  $('#recent-exhibits').innerHTML = exhibits.slice(0, 4).map((item) => `<div class="recent-row"><img src="${escapeHtml(item.image)}" alt=""><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.era)}</small></div><span>Đang xem trước</span></div>`).join('');
  const visible = exhibits.filter((item) => `${item.name} ${item.era}`.toLocaleLowerCase('vi').includes(search));
  $('#admin-exhibit-list').innerHTML = visible.map((item) => `<div class="admin-table-row" tabindex="0" role="button" data-id="${escapeHtml(item.id)}" aria-label="Chỉnh sửa ${escapeHtml(item.name)}"><div class="admin-table-row__main"><img src="${escapeHtml(item.image)}" alt=""><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.material)}</small></div></div><span>${escapeHtml(item.era)}</span><span>${item.position.map(Number).join(', ')}</span><span><small class="published">Demo</small></span><span>↗</span></div>`).join('') || '<div class="empty-state">Không tìm thấy hiện vật.</div>';
  $('#media-preview').innerHTML = exhibits.slice(0, 5).map((item) => `<article><img src="${escapeHtml(item.image)}" alt="Minh họa ${escapeHtml(item.name)}"><strong>${escapeHtml(item.name)}</strong><small>SVG · Minh họa</small></article>`).join('');
  mediaDemo.renderSample();
}

function openEditor(item) {
  editingId = item?.id || null;
  $('#edit-title').textContent = item ? 'Chỉnh sửa hiện vật' : 'Thêm hiện vật';
  form.reset();
  const sample = item || exhibits[0];
  $('#edit-preview').innerHTML = `<img src="${escapeHtml(sample?.image || './assets/gom-lam.svg')}" alt="Ảnh minh họa hiện vật">`;
  for (const field of ['name', 'era', 'material', 'summary', 'description', 'transcript']) form.elements[field].value = item?.[field] || '';
  form.elements.positionX.value = item?.position?.[0] ?? 0;
  form.elements.positionZ.value = item?.position?.[1] ?? -5;
  $('#delete-exhibit').hidden = !item;
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  form.elements.name.focus();
}

function closeEditor() { backdrop.hidden = true; document.body.style.overflow = ''; editingId = null; }

$('#admin-exhibit-list').addEventListener('click', (event) => {
  const row = event.target.closest('[data-id]');
  if (row) openEditor(exhibits.find((item) => item.id === row.dataset.id));
});
$('#admin-exhibit-list').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    const row = event.target.closest('[data-id]');
    if (row) { event.preventDefault(); openEditor(exhibits.find((item) => item.id === row.dataset.id)); }
  }
});
$('#add-exhibit').addEventListener('click', () => openEditor(null));
$('#close-editor').addEventListener('click', closeEditor);
backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeEditor(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !backdrop.hidden) closeEditor(); });

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const existing = exhibits.find((item) => item.id === editingId);
  const item = {
    ...(existing || { id: `demo-${crypto.randomUUID()}`, image: './assets/gom-lam.svg', shape: 'vase', color: '#9cc5bd', order: exhibits.length + 1 }),
    name: String(data.get('name')).trim(), era: String(data.get('era')).trim(), material: String(data.get('material')).trim(),
    summary: String(data.get('summary')).trim(), description: String(data.get('description')).trim(), transcript: String(data.get('transcript')).trim(),
    position: [Number(data.get('positionX')), Number(data.get('positionZ'))],
  };
  if (existing) Object.assign(existing, item); else exhibits.push(item);
  try { saveExhibits(exhibits); recordExhibitEdit(item, !existing); render(); closeEditor(); showToast('Đã lưu bản nháp. Mở Kiểm duyệt để duyệt và xuất bản.'); }
  catch { showToast('Trình duyệt không cho phép lưu dữ liệu cục bộ.'); }
});

$('#delete-exhibit').addEventListener('click', () => {
  if (!editingId || !confirm('Xóa hiện vật khỏi bản demo trên trình duyệt này?')) return;
  const removed = exhibits.find((item) => item.id === editingId);
  exhibits = exhibits.filter((item) => item.id !== editingId);
  saveExhibits(exhibits); recordExhibitDelete(removed); render(); closeEditor(); showToast('Đã xóa hiện vật trong bản demo.');
});
$('#reset-demo').addEventListener('click', () => { if (!confirm('Khôi phục dữ liệu mẫu và bỏ mọi thay đổi demo trong trình duyệt này?')) return; resetExhibits(); resetStudioState(); mediaDemo.reset(); exhibits = getExhibits(); render(); showToast('Đã khôi phục dữ liệu mẫu.'); });
$('#admin-search').addEventListener('input', (event) => { search = event.target.value.trim().toLocaleLowerCase('vi'); render(); });
$$('[data-go]').forEach((button) => button.addEventListener('click', () => { location.hash = button.dataset.go; }));
window.addEventListener('hashchange', activeView);
render(); activeView();
