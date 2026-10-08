export const roles = ['Quản trị viên', 'Biên tập viên', 'Người kiểm duyệt'];

export const permissions = [
  { code: 'rooms.view', name: 'Xem phòng', group: 'Phòng trưng bày', description: 'Xem danh sách và thông tin phòng.' },
  { code: 'rooms.manage', name: 'Quản lý phòng', group: 'Phòng trưng bày', description: 'Tạo, sửa và sắp xếp phòng trưng bày.' },
  { code: 'exhibits.view', name: 'Xem hiện vật', group: 'Hiện vật', description: 'Xem hiện vật và các bản nháp.' },
  { code: 'exhibits.edit', name: 'Biên tập hiện vật', group: 'Hiện vật', description: 'Tạo và sửa nội dung hiện vật.' },
  { code: 'exhibits.review', name: 'Kiểm duyệt hiện vật', group: 'Hiện vật', description: 'Duyệt, từ chối, xuất bản và tạm ẩn.' },
  { code: 'media.view', name: 'Xem media', group: 'Media', description: 'Xem ảnh, model và audio.' },
  { code: 'media.manage', name: 'Quản lý media', group: 'Media', description: 'Thêm, sửa và gỡ media.' },
  { code: 'reports.view', name: 'Xem báo cáo', group: 'Báo cáo', description: 'Xem báo cáo do khách tham quan gửi.' },
  { code: 'reports.resolve', name: 'Xử lý báo cáo', group: 'Báo cáo', description: 'Tiếp nhận và kết luận báo cáo.' },
  { code: 'audit.view', name: 'Xem nhật ký', group: 'Hệ thống', description: 'Xem lịch sử thao tác quản trị.' },
  { code: 'accounts.manage', name: 'Quản lý tài khoản', group: 'Hệ thống', description: 'Thêm tài khoản, đổi vai trò và trạng thái.' },
  { code: 'permissions.manage', name: 'Quản lý phân quyền', group: 'Hệ thống', description: 'Thay đổi quyền được gán cho từng vai trò.' },
];

const editor = ['rooms.view', 'rooms.manage', 'exhibits.view', 'exhibits.edit', 'media.view', 'media.manage', 'reports.view'];
const reviewer = ['rooms.view', 'exhibits.view', 'exhibits.review', 'media.view', 'reports.view', 'reports.resolve', 'audit.view'];

export const defaultRolePermissions = {
  'Quản trị viên': permissions.map(({ code }) => code),
  'Biên tập viên': editor,
  'Người kiểm duyệt': reviewer,
};
