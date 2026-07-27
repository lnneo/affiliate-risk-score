export type Dictionary = {
  brand: {
    name: string;
    badge: string;
    tagline: string;
  };
  nav: {
    simulator: string;
    referral: string;
    store: string;
    dashboard: string;
    config: string;
  };
  common: {
    copy: string;
    copied: string;
    openLink: string;
    cancel: string;
    confirm: string;
    loading: string;
    scanning: string;
    refresh: string;
    refreshing: string;
    reset: string;
  };
  seed: {
    button: string;
    loading: string;
    title: string;
    confirmTitle: string;
    confirmBody: string;
    confirmAction: string;
    success: string;
    error: string;
  };
  language: {
    label: string;
    vi: string;
    en: string;
  };
  referral: {
    eyebrow: string;
    title: string;
    description: string;
    affiliateIdLabel: string;
    fingerprintLabel: string;
    registerDevice: string;
    registering: string;
    registered: string;
    currentDeviceTitle: string;
    currentDeviceBadge: string;
    currentDeviceDesc: string;
    shareTitle: string;
    shareBadge: string;
    shareDesc: string;
    lanTitle: string;
    lanBadge: string;
    lanDesc: string;
    guideTitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
  };
  simulator: {
    eyebrow: string;
    title: string;
    description: string;
    stateTitle: string;
    stateHint: string;
    ruleLabel: string;
    allRules: string;
    orderTitle: string;
    evaluate: string;
    evaluating: string;
    readyTitle: string;
    readyBody: string;
    loadingTitle: string;
    loadingBody: string;
  };
  store: {
    eyebrow: string;
    title: string;
    descriptionPrefix: string;
    checkoutTitle: string;
    pay: string;
    paying: string;
    readyTitle: string;
    readyBody: string;
    loadingTitle: string;
    loadingBody: string;
  };
  dashboard: {
    title: string;
    description: string;
    loadingOverlay: string;
  };
  config: {
    title: string;
    description: string;
    loadingOverlay: string;
  };
};

export const vi: Dictionary = {
  brand: {
    name: 'LinkPul',
    badge: 'Risk Engine v1.0',
    tagline: 'Hệ thống Phát hiện Gian lận Affiliate',
  },
  nav: {
    simulator: 'Giả lập Gian lận',
    referral: 'Tạo Link Thật',
    store: 'Cửa hàng Mua hàng',
    dashboard: 'Nhật ký Audit Admin',
    config: 'Cấu hình Luật',
  },
  common: {
    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    openLink: 'Mở link',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    loading: 'Đang tải...',
    scanning: 'Đang quét...',
    refresh: 'Làm mới',
    refreshing: 'Đang tải...',
    reset: 'Đặt lại',
  },
  seed: {
    button: 'Nạp dữ liệu',
    loading: 'Đang nạp...',
    title: 'Nạp dữ liệu thử nghiệm mẫu',
    confirmTitle: 'Xác nhận nạp dữ liệu?',
    confirmBody:
      'Thao tác này sẽ xóa dữ liệu demo hiện tại (orders, clicks, risk scores) và nạp lại các kịch bản mẫu. Bạn có muốn tiếp tục?',
    confirmAction: 'Nạp dữ liệu',
    success: 'Đã khởi tạo dữ liệu!',
    error: 'Lỗi khởi tạo',
  },
  language: {
    label: 'Ngôn ngữ',
    vi: 'Tiếng Việt',
    en: 'English',
  },
  referral: {
    eyebrow: 'Trung tâm Tạo Link Giới thiệu Thật',
    title: 'Tạo & Gửi Link Giới thiệu (Real Device Testing)',
    description:
      'Sử dụng trang này để lấy Link Giới thiệu thật. Khi bạn hoặc đồng nghiệp mở link này trên máy thật/điện thoại, trình duyệt sẽ tự động thu thập FingerprintJS thực tế, IP thực tế và Session Cookie thực tế gửi về Risk Engine.',
    affiliateIdLabel: 'Chọn ID Người Giới thiệu (Affiliate ID):',
    fingerprintLabel: 'Fingerprint máy bạn:',
    registerDevice: 'Đăng ký thiết bị',
    registering: 'Đang đăng ký...',
    registered: 'Đã lưu Fingerprint làm thiết bị gốc!',
    currentDeviceTitle: '1. Link trên domain hiện tại',
    currentDeviceBadge: 'Current',
    currentDeviceDesc:
      'Mở trực tiếp trên trình duyệt khác trên máy bạn (hoặc tab Ẩn danh) để test đối soát trùng thiết bị/IP với Affiliate.',
    shareTitle: '2. Link chia sẻ',
    shareBadge: 'Share',
    shareDesc: 'Gửi đường link này qua Slack/Zalo cho đồng nghiệp hoặc mở trên điện thoại.',
    lanTitle: '2. Link LAN (cùng Wi-Fi)',
    lanBadge: 'LAN',
    lanDesc:
      'Chỉ dùng khi chạy localhost. Gửi link này cho đồng nghiệp/điện thoại trong cùng mạng Wi-Fi.',
    guideTitle: 'Các Bước Thử nghiệm Thực tế Chuẩn:',
    step1Title: 'Bước 1: Đăng ký Vân tay máy bạn',
    step1Body:
      'Bấm nút “Đăng ký thiết bị” ở trên để hệ thống ghi nhận Fingerprint thực tế của máy bạn làm thiết bị Affiliate chủ.',
    step2Title: 'Bước 2: Mở trình duyệt khác / Gửi đồng nghiệp',
    step2Body:
      'Nếu mở trình duyệt khác trên máy bạn → cảnh báo trùng fingerprint. Nếu đồng nghiệp mở trên máy khác → duyệt sạch.',
    step3Title: 'Bước 3: Kiểm tra Admin Audit Ledger',
    step3Body:
      'Quay lại trang Nhật ký Audit Admin (/admin/dashboard) để xem giao dịch với Fingerprint & IP thật.',
  },
  simulator: {
    eyebrow: '100% Tapfiliate Enterprise Fraud Prevention Specs',
    title: 'Affiliate Fraud & Risk Score Engine',
    description:
      'Hệ thống 15 thuật toán phát hiện gian lận đa tín hiệu: Vân tay thiết bị, IP Blacklist, Referral Cloaking, Tự giới thiệu, Trùng mã chuyển đổi, Velocity & Geolocation Anomaly.',
    stateTitle: 'Giả lập theo trạng thái',
    stateHint: 'Chọn trạng thái, lọc rule, rồi chọn kịch bản mẫu.',
    ruleLabel: 'Rule:',
    allRules: 'Tất cả',
    orderTitle: 'Thông tin Đơn hàng & Người mua',
    evaluate: 'Đánh giá',
    evaluating: 'Đang đối soát...',
    readyTitle: 'Sẵn sàng Đánh giá Kịch bản (100% Tapfiliate Rules)',
    readyBody: 'Bấm nút “Đánh giá” để đối soát tất cả 15 thuật toán phòng chống gian lận.',
    loadingTitle: 'Đang đối soát Risk Engine...',
    loadingBody:
      'Hệ thống đang ghi nhận lượt click, đối soát 15 thuật toán Tapfiliate và tính điểm rủi ro cho kịch bản này.',
  },
  store: {
    eyebrow: 'Cửa hàng Mua hàng Thật (Real Checkout Demo)',
    title: 'Cửa hàng Sản phẩm Pro Plan ($99.00)',
    descriptionPrefix: 'Đơn hàng này được giới thiệu bởi Affiliate',
    checkoutTitle: 'Thông tin Đặt hàng Thực tế',
    pay: 'Thanh toán',
    paying: 'Đang thanh toán...',
    readyTitle: 'Sẵn sàng Đặt hàng & Đánh giá',
    readyBody:
      'Bấm nút “Thanh toán” để mô phỏng một giao dịch thực tế. Kết quả đánh giá Risk Engine sẽ xuất hiện tại đây.',
    loadingTitle: 'Đang xử lý thanh toán...',
    loadingBody: 'Risk Engine đang đánh giá giao dịch và ghi nhận kết quả vào CSDL Admin Audit Ledger.',
  },
  dashboard: {
    title: 'Nhật ký Audit Điểm Rủi ro Affiliate (Admin Ledger)',
    description:
      'Đối soát toàn bộ giao dịch được đánh giá, soi chi tiết các tín hiệu gian lận và thực hiện ghi đè quyết định duyệt/từ chối hoa hồng.',
    loadingOverlay: 'Đang tải nhật ký audit...',
  },
  config: {
    title: 'Cấu hình 15 Quy tắc & Danh sách Đen (Blacklist Manager)',
    description:
      'Điều chỉnh trọng số 15 thuật toán Tapfiliate Enterprise và quản lý Danh sách đen IP/Domain rủi ro cao.',
    loadingOverlay: 'Đang tải danh sách đen...',
  },
};
