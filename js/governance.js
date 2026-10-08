import { getExhibits } from './data.js';
import { defaultRolePermissions, permissions, roles } from './permission-model.js';

const KEY = 'aura-museum-demo-studio-v1';
const clone = (value) => JSON.parse(JSON.stringify(value));

function defaultState() {
  const now = new Date().toISOString();
  const records = {};
  getExhibits().forEach((item) => {
    records[item.id] = {
      id: item.id, status: 'published', hidden: false, deleted: false,
      publishedSnapshot: clone(item),
      versions: [{ number: 1, at: now, author: 'Dữ liệu mẫu', snapshot: clone(item) }],
      reviewNote: '',
    };
  });
  return {
    records,
    reports: [
      { id: 'RP-1042', exhibitId: 'gom-lam', reason: 'Mô tả cần kiểm tra', detail: 'Một đoạn mô tả có thể gây hiểu nhầm về nguồn gốc của hiện vật.', reporter: 'Khách tham quan', at: now, status: 'new', resolution: '' },
      { id: 'RP-1041', exhibitId: 'thien-cau', reason: 'Thông tin thiếu', detail: 'Đề nghị bổ sung nguồn tham khảo khi xuất bản tư liệu chính thức.', reporter: 'Khách tham quan', at: now, status: 'new', resolution: '' },
      { id: 'RP-1040', exhibitId: 'trong-dong', reason: 'Thuyết minh', detail: 'Bản đọc và bản chép lời nên được đối chiếu trước khi công bố.', reporter: 'Nhóm nội dung', at: now, status: 'in_review', resolution: '' },
    ],
    audit: [
      { id: 'EV-001', at: now, actor: 'Hệ thống demo', action: 'Khởi tạo nội dung mẫu', target: '5 hiện vật', detail: 'Tạo dữ liệu minh họa cho prototype.' },
      { id: 'EV-002', at: now, actor: 'Hệ thống demo', action: 'Xuất bản', target: 'Không gian Di sản', detail: 'Hiển thị năm hiện vật mẫu trên trang tham quan.' },
      { id: 'EV-003', at: now, actor: 'Hệ thống demo', action: 'Tạo tài khoản demo', target: 'Content Studio', detail: 'Tạo ba vai trò minh họa: quản trị, biên tập và kiểm duyệt.' },
    ],
    users: [
      { id: 'US-01', name: 'An Trần', email: 'an@aura.demo', role: 'Quản trị viên', status: 'active', initials: 'AT' },
      { id: 'US-02', name: 'Minh Nguyễn', email: 'minh@aura.demo', role: 'Biên tập viên', status: 'active', initials: 'MN' },
      { id: 'US-03', name: 'Linh Lê', email: 'linh@aura.demo', role: 'Người kiểm duyệt', status: 'active', initials: 'LL' },
    ],
    rolePermissions: clone(defaultRolePermissions),
  };
}

export function getStudioState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && saved.records && Array.isArray(saved.reports) && Array.isArray(saved.audit) && Array.isArray(saved.users)) {
      saved.rolePermissions = Object.fromEntries(roles.map((role) => [role, Array.isArray(saved.rolePermissions?.[role]) ? saved.rolePermissions[role].filter((code) => permissions.some((permission) => permission.code === code)) : [...defaultRolePermissions[role]]]));
      return saved;
    }
  } catch { /* Fall back to bundled demo data. */ }
  const state = defaultState();
  saveStudioState(state);
  return state;
}

export function saveStudioState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetStudioState() {
  localStorage.removeItem(KEY);
  return getStudioState();
}

function log(state, action, target, detail, actor = 'Demo admin') {
  state.audit.unshift({ id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, at: new Date().toISOString(), actor, action, target, detail });
  state.audit = state.audit.slice(0, 300);
}

export function getPublicExhibits() {
  const state = getStudioState();
  const activeIds = new Set(getExhibits().map((item) => item.id));
  return Object.values(state.records)
    .filter((record) => activeIds.has(record.id) && !record.hidden && !record.deleted && record.publishedSnapshot)
    .map((record) => clone(record.publishedSnapshot))
    .sort((a, b) => a.order - b.order);
}

export function recordExhibitEdit(item, isNew) {
  const state = getStudioState();
  let record = state.records[item.id];
  if (!record) {
    record = { id: item.id, status: 'pending', hidden: false, deleted: false, publishedSnapshot: null, versions: [], reviewNote: '' };
    state.records[item.id] = record;
  }
  const number = (record.versions.at(-1)?.number || 0) + 1;
  record.versions.push({ number, at: new Date().toISOString(), author: 'Demo admin', snapshot: clone(item) });
  record.status = 'pending';
  record.reviewNote = '';
  log(state, isNew ? 'Tạo hiện vật' : 'Cập nhật bản nháp', item.name, `Phiên bản ${number} đang chờ duyệt.`);
  saveStudioState(state);
}

export function recordExhibitDelete(item) {
  const state = getStudioState();
  if (state.records[item.id]) state.records[item.id].deleted = true;
  log(state, 'Xóa hiện vật', item.name, 'Gỡ hiện vật khỏi dữ liệu demo. Lịch sử phiên bản vẫn được giữ trong trình duyệt.');
  saveStudioState(state);
}

export const reviewLabels = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối', published: 'Đã xuất bản', hidden: 'Tạm ẩn' };

export function reviewExhibit(id, action, note = '') {
  const state = getStudioState();
  const record = state.records[id];
  if (!record || record.deleted) return false;
  const latest = record.versions.at(-1);
  const name = latest?.snapshot.name || id;
  if (action === 'approve' && record.status === 'pending') record.status = 'approved';
  else if (action === 'reject' && ['pending', 'approved'].includes(record.status)) record.status = 'rejected';
  else if (action === 'publish' && ['approved', 'published', 'hidden'].includes(record.status)) {
    record.status = 'published'; record.hidden = false; record.publishedSnapshot = clone(latest.snapshot);
  }
  else if (action === 'hide' && record.status === 'published' && record.publishedSnapshot && !record.hidden) { record.status = 'hidden'; record.hidden = true; }
  else return false;
  record.reviewNote = note;
  const actions = { approve: 'Duyệt nội dung', reject: 'Từ chối nội dung', publish: 'Xuất bản', hide: 'Tạm ẩn' };
  log(state, actions[action], name, `${note || reviewLabels[record.status]} · Phiên bản ${latest.number}`);
  saveStudioState(state);
  return true;
}

export const reportLabels = { new: 'Mới tiếp nhận', in_review: 'Đang xử lý', resolved: 'Đã xử lý', dismissed: 'Không hợp lệ' };

export function submitReport(exhibitId, reason, detail) {
  const state = getStudioState();
  const report = { id: `RP-${Date.now().toString().slice(-7)}`, exhibitId, reason, detail, reporter: 'Khách tham quan', at: new Date().toISOString(), status: 'new', resolution: '' };
  state.reports.unshift(report);
  log(state, 'Tiếp nhận báo cáo', report.id, `${reason} · ${exhibitId}`, 'Khách tham quan');
  saveStudioState(state);
  return report;
}

export function processReport(id, status, resolution) {
  const state = getStudioState();
  const report = state.reports.find((item) => item.id === id);
  if (!report || !['in_review', 'resolved', 'dismissed'].includes(status)) return false;
  report.status = status;
  report.resolution = resolution;
  log(state, 'Xử lý báo cáo', id, `${reportLabels[status]}${resolution ? ` · ${resolution}` : ''}`);
  saveStudioState(state);
  return true;
}

export { roles };

export function setRolePermission(role, code, enabled) {
  if (!roles.includes(role) || !permissions.some((permission) => permission.code === code)) return false;
  const state = getStudioState();
  const assigned = new Set(state.rolePermissions[role]);
  if (enabled) assigned.add(code);
  else assigned.delete(code);
  state.rolePermissions[role] = [...assigned];
  log(state, 'Cập nhật ma trận quyền demo', role, `${enabled ? 'Cấp' : 'Thu hồi'} ${code}`);
  saveStudioState(state);
  return true;
}

export function resetRolePermissions() {
  const state = getStudioState();
  state.rolePermissions = clone(defaultRolePermissions);
  log(state, 'Khôi phục ma trận quyền demo', 'Ba vai trò', 'Trở về bộ quyền minh họa ban đầu.');
  saveStudioState(state);
}

export function addDemoUser(name, email, role) {
  const state = getStudioState();
  if (state.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) return false;
  state.users.push({ id: `US-${Date.now()}`, name, email, role, status: 'active', initials: name.split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join('') });
  log(state, 'Thêm tài khoản demo', email, `Vai trò: ${role}`);
  saveStudioState(state);
  return true;
}

export function updateDemoUser(id, { role, status }) {
  const state = getStudioState();
  const user = state.users.find((item) => item.id === id);
  if (!user) return false;
  const before = `${user.role} · ${user.status}`;
  if (role && roles.includes(role)) user.role = role;
  if (status && ['active', 'inactive'].includes(status)) user.status = status;
  log(state, 'Cập nhật tài khoản demo', user.email, `${before} → ${user.role} · ${user.status}`);
  saveStudioState(state);
  return true;
}
