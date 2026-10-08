import { getStudioState, addDemoUser, updateDemoUser } from './governance.js';
import { $, escapeHtml, showToast } from './shared.js';
import { mountStudioShell } from './studio-shell.js';

mountStudioShell('accounts', 'Tài khoản Admin');
let search = '', editingId = null;
const backdrop = $('#account-backdrop');
const form = $('#account-form');

function render() {
  const users = getStudioState().users;
  $('#users-total').textContent = users.length;
  $('#users-active').textContent = users.filter((user) => user.status === 'active').length;
  const visible = users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLocaleLowerCase('vi').includes(search));
  $('#account-list').innerHTML = visible.map((user) => `<button type="button" class="studio-row" data-id="${escapeHtml(user.id)}"><span class="account-avatar">${escapeHtml(user.initials)}</span><span class="studio-row__main"><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></span><span class="role-badge">${escapeHtml(user.role)}</span><span class="status-badge status-badge--${user.status}">${user.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa'}</span><span class="studio-row__arrow">↗</span></button>`).join('') || '<div class="empty-state">Không tìm thấy tài khoản.</div>';
}

function open(user = null) {
  editingId = user?.id || null;
  $('#account-title').textContent = user ? 'Chỉnh sửa quyền' : 'Thêm tài khoản demo';
  form.reset();
  form.elements.name.value = user?.name || '';
  form.elements.email.value = user?.email || '';
  form.elements.role.value = user?.role || 'Biên tập viên';
  form.elements.status.value = user?.status || 'active';
  form.elements.name.readOnly = Boolean(user);
  form.elements.email.readOnly = Boolean(user);
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  (user ? form.elements.role : form.elements.name).focus();
}
function close() { backdrop.hidden = true; document.body.style.overflow = ''; editingId = null; }

$('#add-account').addEventListener('click', () => open());
$('#account-list').addEventListener('click', (event) => { const row = event.target.closest('[data-id]'); if (row) open(getStudioState().users.find((user) => user.id === row.dataset.id)); });
$('#close-account').addEventListener('click', close);
$('#cancel-account').addEventListener('click', close);
backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !backdrop.hidden) close(); });
$('#account-search').addEventListener('input', (event) => { search = event.target.value.trim().toLocaleLowerCase('vi'); render(); });
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  let success;
  if (editingId) success = updateDemoUser(editingId, { role: String(data.get('role')), status: String(data.get('status')) });
  else success = addDemoUser(String(data.get('name')).trim(), String(data.get('email')).trim(), String(data.get('role')));
  if (!success) { showToast('Email đã tồn tại hoặc dữ liệu không hợp lệ.'); return; }
  close(); render(); showToast('Đã cập nhật tài khoản mô phỏng trong trình duyệt.');
});
render();
