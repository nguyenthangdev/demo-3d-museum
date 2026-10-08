import { getStudioState } from './governance.js';
import { $, $$, escapeHtml, showToast } from './shared.js';
import { mountStudioShell } from './studio-shell.js';

mountStudioShell('audit', 'Nhật ký thao tác');
let filter = 'all', search = '';
const formatTime = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

function category(action) {
  if (/báo cáo/i.test(action)) return 'report';
  if (/tài khoản/i.test(action)) return 'account';
  if (/duyệt|từ chối|xuất bản|tạm ẩn/i.test(action)) return 'review';
  return 'content';
}

function render() {
  const entries = getStudioState().audit;
  $('#audit-total').textContent = entries.length;
  $('#audit-review').textContent = entries.filter((entry) => category(entry.action) === 'review').length;
  $('#audit-reports').textContent = entries.filter((entry) => category(entry.action) === 'report').length;
  const visible = entries.filter((entry) => (filter === 'all' || category(entry.action) === filter) && `${entry.action} ${entry.actor} ${entry.target} ${entry.detail}`.toLocaleLowerCase('vi').includes(search));
  $('#audit-list').innerHTML = visible.map((entry) => `<details class="audit-entry"><summary><span class="audit-icon audit-icon--${category(entry.action)}">${{ content: '◇', review: '✧', report: '⚑', account: '♙' }[category(entry.action)]}</span><span class="audit-entry__main"><strong>${escapeHtml(entry.action)}</strong><small>${escapeHtml(entry.actor)} · ${escapeHtml(entry.target)}</small></span><time>${formatTime(entry.at)}</time><span class="audit-chevron">⌄</span></summary><div class="audit-entry__detail"><span>MÃ SỰ KIỆN: ${escapeHtml(entry.id)}</span><p>${escapeHtml(entry.detail)}</p></div></details>`).join('') || '<div class="empty-state">Không có sự kiện phù hợp.</div>';
}

$$('#audit-filters [data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter; $$('#audit-filters [data-filter]').forEach((other) => other.classList.toggle('is-active', other === button)); render(); }));
$('#audit-search').addEventListener('input', (event) => { search = event.target.value.trim().toLocaleLowerCase('vi'); render(); });
$('#download-audit').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(getStudioState().audit, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'aura-demo-audit.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Đã tạo tệp JSON từ nhật ký demo.');
});
render();
