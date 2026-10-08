import { permissions } from './permission-model.js';
import { $, escapeHtml } from './shared.js';
import { mountStudioShell } from './studio-shell.js';

mountStudioShell('permissions', 'Danh sách quyền');
$('#permission-count').textContent = permissions.length;
$('#group-count').textContent = new Set(permissions.map(({ group }) => group)).size;

function render(query = '') {
  const visible = permissions.filter(({ code, name, group, description }) => `${code} ${name} ${group} ${description}`.toLocaleLowerCase('vi').includes(query));
  $('#permission-list').innerHTML = visible.map(({ code, name, group, description }) => `<article class="permission-item"><span class="permission-item__symbol">◈</span><div><strong>${escapeHtml(name)}</strong><p>${escapeHtml(description)}</p></div><code>${escapeHtml(code)}</code><span class="permission-item__group">${escapeHtml(group)}</span></article>`).join('') || '<div class="empty-state">Không tìm thấy quyền.</div>';
}

$('#permission-search').addEventListener('input', (event) => render(event.target.value.trim().toLocaleLowerCase('vi')));
render();
