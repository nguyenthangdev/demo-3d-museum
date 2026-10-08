const STORAGE_KEY = 'aura-museum-demo-exhibits-v1';

export const initialExhibits = [
  {
    id: 'gom-lam', name: 'Bình gốm Lam', era: 'Không gian Gốm', material: 'Gốm men · Mô phỏng',
    summary: 'Một dáng bình gốm thanh thoát, gợi nhắc kỹ nghệ trang trí truyền thống.',
    description: 'Bình gốm Lam là hiện vật mô phỏng được tạo riêng cho bản demo. Những đường men xanh và tỷ lệ cân đối giúp người tham quan hình dung cách một hiện vật được trưng bày, kể chuyện và gắn với nội dung số trong bảo tàng.',
    transcript: 'Bạn đang ngắm Bình gốm Lam. Đây là hiện vật mô phỏng cho bản demo Aura Museum. Hãy quan sát dáng bình, sắc men xanh và cách ánh sáng làm nổi bật bề mặt gốm.',
    image: './assets/gom-lam.svg', shape: 'vase', color: '#9cc5bd', position: [-7, -4], order: 1,
  },
  {
    id: 'trong-dong', name: 'Trống đồng Ánh Dương', era: 'Không gian Kim khí', material: 'Đồng · Mô phỏng',
    summary: 'Hoa văn đồng tâm tạo nên nhịp điệu thị giác đặc trưng của chiếc trống.',
    description: 'Một mẫu trống đồng 3D được dựng bằng hình khối đơn giản. Các vòng đồng tâm trên mặt trống chỉ mang tính minh họa; nội dung hiện vật thực tế cần được kiểm chứng và biên tập bởi người phụ trách bảo tàng.',
    transcript: 'Trước mặt bạn là Trống đồng Ánh Dương, một mô hình minh họa. Các đường tròn đồng tâm dẫn mắt từ tâm trống ra phía ngoài, tạo nên một nhịp điệu trang trí mạnh mẽ.',
    image: './assets/trong-dong.svg', shape: 'drum', color: '#c8a978', position: [-3.5, -6.1], order: 2,
  },
  {
    id: 'tuong-sen', name: 'Tượng Sen Tĩnh', era: 'Không gian Điêu khắc', material: 'Đá · Mô phỏng',
    summary: 'Một nghiên cứu hình khối về sự tĩnh lặng và đường nét mềm mại.',
    description: 'Tượng Sen Tĩnh là tác phẩm mô phỏng, không đại diện cho một hiện vật lịch sử cụ thể. Trong không gian thử nghiệm, tác phẩm giúp thể hiện ánh sáng, bục trưng bày và điểm tương tác quanh vật thể 3D.',
    transcript: 'Tượng Sen Tĩnh là mô hình điêu khắc thử nghiệm. Những khối đơn giản tạo thành dáng tượng và đài sen, giúp bạn thử thao tác quan sát hiện vật trong môi trường ba chiều.',
    image: './assets/tuong-sen.svg', shape: 'statue', color: '#e5d9bb', position: [0, -7.2], order: 3,
  },
  {
    id: 'thien-cau', name: 'Thiên cầu Cổ', era: 'Không gian Khám phá', material: 'Kim loại · Mô phỏng',
    summary: 'Những vòng quỹ đạo lồng vào nhau khơi gợi hành trình quan sát bầu trời.',
    description: 'Thiên cầu Cổ là thiết kế minh họa cho trải nghiệm WebXR. Những vành kim loại và quả cầu ở tâm được tạo bằng hình học 3D, cho phép người dùng quan sát từ nhiều góc độ.',
    transcript: 'Thiên cầu Cổ là vật thể mô phỏng gồm nhiều vòng kim loại xoay quanh một tâm. Hãy di chuyển trong phòng để nhìn cách các vòng thay đổi khi bạn đổi góc quan sát.',
    image: './assets/thien-cau.svg', shape: 'sphere', color: '#c2b08c', position: [3.5, -6.1], order: 4,
  },
  {
    id: 'sac-phong', name: 'Cuộn thư Di sản', era: 'Không gian Tư liệu', material: 'Giấy · Mô phỏng',
    summary: 'Một cuộn thư gợi mở cách trình bày hiện vật có văn bản và bản đọc.',
    description: 'Cuộn thư Di sản là vật thể minh họa cho nội dung nhiều định dạng. Trong sản phẩm hoàn chỉnh, mô tả, ảnh, âm thanh và bản chép lời sẽ được biên tập và quản lý qua CMS.',
    transcript: 'Cuộn thư Di sản là hiện vật mô phỏng. Trong bản demo, nó cho thấy cách một tư liệu có thể đi cùng phần mô tả ngắn, hình minh họa và bản chép lời dễ tiếp cận.',
    image: './assets/cuon-thu.svg', shape: 'scroll', color: '#e4cda2', position: [7, -4], order: 5,
  },
];

export function getExhibits() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved)) return saved;
  } catch { /* Use bundled demo data if storage is unavailable. */ }
  return structuredClone(initialExhibits);
}

export function saveExhibits(exhibits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exhibits));
}

export function resetExhibits() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getExhibit(id) {
  return getExhibits().find((item) => item.id === id);
}
