import { getStudioState, processReport, reportLabels } from './governance.js';
import { getExhibits } from './data.js';
import { $, $$, escapeHtml, showToast } from './shared.js';
import { mountStudioShell } from './studio-shell.js';

mountStudioShell('reports', 'Báo cáo nội dung');
let filter = 'all', search = '', selectedId = null;
const backdrop = $('#report-backdrop');
const formatTime = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

function exhibitName(id) { return getExhibits().find((item) => item.id === id)?.name || 'Hiện vật đã gỡ'; }

function render() {
  const reports = getStudioState().reports;
  $('#reports-new').textContent = reports.filter((item) => item.status === 'new').length;
  $('#reports-review').textContent = reports.filter((item) => item.status === 'in_review').length;
  $('#reports-done').textContent = reports.filter((item) => ['resolved', 'dismissed'].includes(item.status)).length;
  const visible = reports.filter((item) => (filter === 'all' || item.status === filter) && `${item.id} ${item.reason} ${item.detail} ${exhibitName(item.exhibitId)}`.toLocaleLowerCase('vi').includes(search));
  $('#report-list').innerHTML = visible.map((item) => `<button class="studio-row" type="button" data-id="${escapeHtml(item.id)}"><span class="report-symbol">⚑</span><span class="studio-row__main"><strong>${escapeHtml(item.reason)}</strong><small>${escapeHtml(exhibitName(item.exhibitId))} · ${escapeHtml(item.id)}</small></span><span class="status-badge status-badge--${item.status}">${reportLabels[item.status]}</span><span class="studio-row__aside">${formatTime(item.at)}</span><span class="studio-row__arrow">↗</span></button>`).join('') || '<div class="empty-state">Không có báo cáo phù hợp.</div>';
}

function detail() {
  const report = getStudioState().reports.find((item) => item.id === selectedId);
  if (!report) { close(); return; }
  $('#report-title').textContent = report.id;
  $('#report-detail').innerHTML = `<div class="report-detail-card"><span class="status-badge status-badge--${report.status}">${reportLabels[report.status]}</span><p class="eyebrow">${escapeHtml(report.reason)}</p><h3>${escapeHtml(exhibitName(report.exhibitId))}</h3><p>${escapeHtml(report.detail)}</p></div><div class="review-detail__body"><div class="report-meta"><div><span>MÃ BÁO CÁO</span><strong>${escapeHtml(report.id)}</strong></div><div><span>NGƯỜI GỬI</span><strong>${escapeHtml(report.reporter)}</strong></div><div><span>TIẾP NHẬN</span><strong>${formatTime(report.at)}</strong></div></div><label class="review-note-label">Kết quả / ghi chú xử lý<textarea id="resolution-note" rows="5" placeholder="Ghi rõ kết quả đối chiếu hoặc lý do đóng báo cáo...">${escapeHtml(report.resolution)}</textarea></label><div class="review-actions"><button type="button" data-status="in_review" ${report.status === 'in_review' ? 'disabled' : ''}>◷ Tiếp nhận</button><button type="button" data-status="resolved" ${report.status === 'resolved' ? 'disabled' : ''}>✓ Đã xử lý</button><button type="button" data-status="dismissed" ${report.status === 'dismissed' ? 'disabled' : ''}>× Không hợp lệ</button></div><p class="review-hint">Mọi thay đổi trạng thái sẽ được ghi vào Nhật ký thao tác của bản demo.</p></div>`;
}

function open(id) { selectedId = id; backdrop.hidden = false; document.body.style.overflow = 'hidden'; detail(); }
function close() { backdrop.hidden = true; document.body.style.overflow = ''; selectedId = null; }

$('#report-list').addEventListener('click', (event) => { const row = event.target.closest('[data-id]'); if (row) open(row.dataset.id); });
$('#report-detail').addEventListener('click', (event) => {
  const button = event.target.closest('[data-status]');
  if (!button || button.disabled) return;
  const note = $('#resolution-note').value.trim();
  if (['resolved', 'dismissed'].includes(button.dataset.status) && !note) { showToast('Hãy ghi kết quả xử lý trước khi đóng báo cáo.'); $('#resolution-note').focus(); return; }
  if (processReport(selectedId, button.dataset.status, note)) { render(); detail(); showToast('Đã cập nhật báo cáo trong bản demo.'); }
});
$('#close-report').addEventListener('click', close);
backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !backdrop.hidden) close(); });
$$('#report-filters [data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter; $$('#report-filters [data-filter]').forEach((other) => other.classList.toggle('is-active', other === button)); render(); }));
$('#report-search').addEventListener('input', (event) => { search = event.target.value.trim().toLocaleLowerCase('vi'); render(); });
render();
