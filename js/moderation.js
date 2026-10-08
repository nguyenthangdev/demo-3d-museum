import { getExhibits } from './data.js';
import { getStudioState, getPublicExhibits, reviewExhibit, reviewLabels } from './governance.js';
import { $, $$, escapeHtml, showToast } from './shared.js';
import { mountStudioShell } from './studio-shell.js';

mountStudioShell('moderation', 'Kiểm duyệt');
let filter = 'all';
let search = '';
let selectedId = null;
let selectedVersion = null;
const backdrop = $('#review-backdrop');
const formatTime = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

function currentItems() {
  const state = getStudioState();
  return getExhibits().map((item) => ({ item, record: state.records[item.id] })).filter((entry) => entry.record && !entry.record.deleted);
}

function render() {
  const items = currentItems();
  $('#metric-pending').textContent = items.filter(({ record }) => record.status === 'pending').length;
  $('#metric-approved').textContent = items.filter(({ record }) => record.status === 'approved').length;
  $('#metric-public').textContent = getPublicExhibits().length;
  const visible = items.filter(({ item, record }) => (filter === 'all' || record.status === filter) && `${item.name} ${item.era}`.toLocaleLowerCase('vi').includes(search));
  $('#moderation-list').innerHTML = visible.map(({ item, record }) => `<button class="studio-row" type="button" data-id="${escapeHtml(item.id)}"><img src="${escapeHtml(item.image)}" alt=""><span class="studio-row__main"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.era)} · Phiên bản ${record.versions.at(-1)?.number || 1}</small></span><span class="status-badge status-badge--${record.status}">${reviewLabels[record.status] || record.status}</span><span class="studio-row__aside">${record.publishedSnapshot && !record.hidden ? 'Đang có bản công khai' : 'Chưa hiển thị'}</span><span class="studio-row__arrow">↗</span></button>`).join('') || '<div class="empty-state">Không có hiện vật phù hợp. Hãy chỉnh sửa một hiện vật để tạo bản chờ duyệt.</div>';
}

function detail() {
  const entry = currentItems().find(({ item }) => item.id === selectedId);
  if (!entry) { close(); return; }
  const { item, record } = entry;
  $('#review-title').textContent = item.name;
  const latest = record.versions.at(-1);
  selectedVersion ??= latest.number;
  const version = record.versions.find((entry) => entry.number === selectedVersion) || latest;
  const snapshot = version.snapshot;
  const latestSelected = version.number === latest.number;
  const canApprove = latestSelected && record.status === 'pending';
  const canReject = latestSelected && ['pending', 'approved'].includes(record.status);
  const canPublish = latestSelected && ['approved', 'published', 'hidden'].includes(record.status);
  const canHide = latestSelected && record.status === 'published' && Boolean(record.publishedSnapshot && !record.hidden);
  $('#review-detail').innerHTML = `<div class="review-cover"><img src="${escapeHtml(snapshot.image)}" alt="Minh họa ${escapeHtml(snapshot.name)}"></div><div class="review-detail__body"><div class="review-status"><span class="status-badge status-badge--${record.status}">${reviewLabels[record.status]}</span><span>${record.publishedSnapshot && !record.hidden ? 'Bản công khai đang hiển thị' : 'Chưa hiển thị công khai'}</span></div><h3>${escapeHtml(snapshot.name)}</h3><p>${escapeHtml(snapshot.description)}</p><div class="review-versions"><div class="admin-section-head"><h4>Lịch sử phiên bản</h4><small>${record.versions.length} phiên bản</small></div>${[...record.versions].reverse().map((entry) => `<button type="button" data-version="${entry.number}" class="version-row ${entry.number === version.number ? 'is-active' : ''}"><span>V${entry.number}</span><div><strong>${escapeHtml(entry.snapshot.name)}</strong><small>${formatTime(entry.at)} · ${escapeHtml(entry.author)}</small></div><span>→</span></button>`).join('')}</div><div class="version-preview"><p class="eyebrow">ĐANG XEM PHIÊN BẢN ${version.number}</p><strong>${escapeHtml(snapshot.summary)}</strong><p>${escapeHtml(snapshot.transcript)}</p></div><label class="review-note-label">Ghi chú kiểm duyệt<textarea id="review-note" rows="3" placeholder="Lý do từ chối hoặc ghi chú cho lần xử lý...">${escapeHtml(record.reviewNote)}</textarea></label><div class="review-actions"><button type="button" data-action="approve" ${canApprove ? '' : 'disabled'}>✓ Duyệt</button><button type="button" data-action="reject" ${canReject ? '' : 'disabled'}>× Từ chối</button><button type="button" data-action="publish" ${canPublish ? '' : 'disabled'}>↗ Xuất bản</button><button type="button" data-action="hide" ${canHide ? '' : 'disabled'}>◌ Tạm ẩn</button></div><p class="review-hint">Chọn phiên bản để xem nội dung. Thao tác kiểm duyệt chỉ áp dụng cho phiên bản mới nhất.</p></div>`;
}

function open(id) { selectedId = id; selectedVersion = null; backdrop.hidden = false; document.body.style.overflow = 'hidden'; detail(); }
function close() { backdrop.hidden = true; document.body.style.overflow = ''; selectedId = null; selectedVersion = null; }

$('#moderation-list').addEventListener('click', (event) => { const row = event.target.closest('[data-id]'); if (row) open(row.dataset.id); });
$('#review-detail').addEventListener('click', (event) => {
  const version = event.target.closest('[data-version]');
  if (version) { selectedVersion = Number(version.dataset.version); detail(); return; }
  const action = event.target.closest('[data-action]');
  if (!action || action.disabled) return;
  const note = $('#review-note').value.trim();
  if (action.dataset.action === 'reject' && !note) { showToast('Hãy ghi lý do từ chối trước khi xử lý.'); $('#review-note').focus(); return; }
  if (reviewExhibit(selectedId, action.dataset.action, note)) { selectedVersion = null; render(); detail(); showToast('Đã cập nhật trạng thái trong bản demo.'); }
});
$('#close-review').addEventListener('click', close);
backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !backdrop.hidden) close(); });
$$('#moderation-filters [data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter; $$('#moderation-filters [data-filter]').forEach((other) => other.classList.toggle('is-active', other === button)); render(); }));
$('#moderation-search').addEventListener('input', (event) => { search = event.target.value.trim().toLocaleLowerCase('vi'); render(); });
render();
