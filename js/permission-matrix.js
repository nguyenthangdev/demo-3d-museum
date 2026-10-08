import { getStudioState, resetRolePermissions, setRolePermission } from './governance.js';
import { permissions, roles } from './permission-model.js';
import { $, escapeHtml, showToast } from './shared.js';
import { mountStudioShell } from './studio-shell.js';

mountStudioShell('permission-matrix', 'Ma trận phân quyền');

function render() {
  const assigned = getStudioState().rolePermissions;
  $('#permission-matrix-body').innerHTML = permissions.map(({ code, name, group }) => `<tr><th scope="row"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(code)} · ${escapeHtml(group)}</small></th>${roles.map((role) => `<td><input type="checkbox" data-role="${escapeHtml(role)}" data-code="${escapeHtml(code)}" aria-label="${escapeHtml(role)}: ${escapeHtml(name)}" ${assigned[role].includes(code) ? 'checked' : ''}></td>`).join('')}</tr>`).join('');
}

$('#permission-matrix-body').addEventListener('change', (event) => {
  const input = event.target.closest('input[data-role][data-code]');
  if (!input) return;
  if (setRolePermission(input.dataset.role, input.dataset.code, input.checked)) showToast('Đã cập nhật ma trận mô phỏng.');
  else render();
});

$('#reset-matrix').addEventListener('click', () => {
  resetRolePermissions();
  render();
  showToast('Đã khôi phục ma trận mẫu.');
});

render();
