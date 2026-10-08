# Aura Museum — demo giao diện

Bản demo tĩnh để hình dung hướng thiết kế của bảo tàng WebXR. Có mười trang liên kết với nhau:

- `index.html`: trang giới thiệu và cảnh 3D xem trước.
- `tour.html`: phòng 3D với năm hiện vật minh họa, WASD, kéo chuột, joystick cảm ứng, điểm tương tác, thuyết minh bằng giọng máy và bản chép lời. Nút WebXR hiện khi trình duyệt và thiết bị báo hỗ trợ.
- `collection.html`: bộ sưu tập, lọc, tìm kiếm và xem chi tiết.
- `admin.html`: tổng quan Content Studio; thêm/sửa/xóa hiện vật trong dữ liệu mô phỏng. Tab Media cho chọn ảnh/audio để xem trước, nghe thử và nhập transcript tạm.
- `moderation.html`: xem phiên bản, duyệt, từ chối, xuất bản và tạm ẩn hiện vật.
- `reports.html`: tiếp nhận và xử lý báo cáo nội dung sai gửi từ trang chi tiết hiện vật.
- `audit.html`: tìm kiếm, xem và tải JSON nhật ký thao tác của demo.
- `accounts.html`: tài khoản Admin; thêm tài khoản mô phỏng và thay đổi vai trò/trạng thái.
- `permissions.html`: danh sách mã quyền, mô tả và nhóm chức năng.
- `permission-matrix.html`: ma trận quyền theo vai trò; có thể bật/tắt và khôi phục dữ liệu mẫu trong trình duyệt.

Luồng thử: sửa một hiện vật tại `admin.html#exhibits`, vào `moderation.html` duyệt rồi xuất bản, tải lại `collection.html` hoặc `tour.html` để thấy nội dung mới. Từ chi tiết hiện vật, gửi một báo cáo và mở `reports.html` để xử lý. Các thao tác sẽ xuất hiện ở `audit.html`. Nút khôi phục dữ liệu mẫu nằm ở trang tổng quan Admin.

## Chạy

Mở terminal trong thư mục `demo` và chạy:

```sh
python3 -m http.server 4173
```

Truy cập `http://localhost:4173`. Nên dùng HTTP server vì JavaScript ES modules không chạy ổn định khi mở HTML trực tiếp bằng `file://`.

Không cần cài package, backend hoặc database. Three.js đã được đóng gói trong `vendor/`. Font web chỉ là tùy chọn; khi offline, giao diện dùng font hệ thống.

## Phạm vi bản demo

Năm hiện vật, ảnh minh họa và lời thuyết minh là nội dung mô phỏng. Thuyết minh mẫu dùng Web Speech API trên thiết bị, không phải file audio thật. Ảnh/audio chọn trong tab Media chỉ được xem trước trong phiên mở trang; tải lại trang sẽ mất, chưa gửi lên Storage hoặc gắn vào hiện vật. Demo hỗ trợ ảnh PNG/JPEG/WebP tối đa 10 MB, audio MP3/WAV/OGG/M4A/WebM tối đa 25 MB và tối đa 12 file cùng lúc; khả năng phát phụ thuộc trình duyệt. Chưa có upload GLB. Content Studio chỉ lưu dữ liệu hiện vật trong trình duyệt hiện tại; tài khoản, danh sách quyền và ma trận chỉ minh họa, không có đăng nhập hoặc phân quyền thật. Thay đổi ma trận không khóa chức năng hoặc API. Audit log không phải nhật ký máy chủ. Chưa có API, PostgreSQL hay Supabase Storage. Khả năng vào VR phụ thuộc trình duyệt, HTTPS/localhost và thiết bị WebXR. Bản này là prototype giao diện riêng, không thay thế ứng dụng React/NestJS trong `ailabs-museum`.

Three.js v0.170.0 được sao chép từ dependency sẵn có của `ailabs-museum/front-end`; giấy phép MIT ở `vendor/THREE-LICENSE.txt`.
