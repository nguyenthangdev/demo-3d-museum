import { getExhibits } from './data.js';

const sections = [
  { href: './admin.html', icon: '◫', title: 'Tổng quan', key: 'overview' },
  { href: './admin.html#exhibits', icon: '◇', title: 'Hiện vật', key: 'exhibits' },
  { href: './admin.html#rooms', icon: '▦', title: 'Phòng trưng bày', key: 'rooms' },
  { href: './admin.html#media', icon: '▧', title: 'Thư viện media', key: 'media' },
  { href: './moderation.html', icon: '✧', title: 'Kiểm duyệt', key: 'moderation' },
  { href: './reports.html', icon: '⚑', title: 'Báo cáo nội dung', key: 'reports' },
  { href: './audit.html', icon: '≡', title: 'Nhật ký thao tác', key: 'audit' },
  { href: './accounts.html', icon: '♙', title: 'Tài khoản Admin', key: 'accounts' },
  { href: './permissions.html', icon: '◈', title: 'Danh sách quyền', key: 'permissions' },
  { href: './permission-matrix.html', icon: '▤', title: 'Ma trận phân quyền', key: 'permission-matrix' },
];

export function mountStudioShell(current, title) {
  const shell = document.querySelector('#studio-shell');
  const content = shell.querySelector('.admin-content');
  const nav = sections.map((section) => `<a href="${section.href}" class="${section.key === current ? 'is-active' : ''}" ${section.key === current ? 'aria-current="page"' : ''}>${section.icon} <span>${section.title}</span>${section.key === 'exhibits' ? `<small>${String(getExhibits().length).padStart(2, '0')}</small>` : ''}</a>`).join('');
  shell.insertAdjacentHTML('afterbegin', `<aside class="admin-sidebar"><a class="brand brand--admin" href="./index.html"><span class="brand__mark">✦</span><span>AURA <small>CONTENT STUDIO</small></span></a><div class="admin-workspace"><span class="workspace-avatar">A</span><div><strong>Aura Museum</strong><small>Demo workspace</small></div><span>⌄</span></div><p class="admin-nav-label">KHÔNG GIAN LÀM VIỆC</p><nav class="admin-side-nav">${nav}</nav><div class="admin-sidebar__bottom"><div class="demo-tag">● Chế độ demo · lưu trong trình duyệt</div><a href="./tour.html">↗ <span>Mở trang tham quan</span></a><a href="./index.html">← <span>Về trang chủ</span></a></div></aside>`);
  content.insertAdjacentHTML('afterbegin', `<header class="admin-topbar"><div><span>Workspace</span><b>/</b><strong>${title}</strong></div><div class="admin-topbar__right"><span class="admin-preview-pill"><i></i> Xem trước</span><span class="admin-user">AT</span></div></header>`);
}
