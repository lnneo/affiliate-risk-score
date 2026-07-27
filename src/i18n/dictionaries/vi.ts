type ScenarioEntry = { name: string; description: string; expectedScore: string };

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
    points: string;
    enable: string;
    disable: string;
    enabling: string;
    disabling: string;
    add: string;
    adding: string;
    delete: string;
    deleting: string;
    detail: string;
    approve: string;
    approving: string;
    reject: string;
    rejecting: string;
    all: string;
    score: string;
    email: string;
    paypal: string;
    fingerprint: string;
    ip: string;
    cookieId: string;
    affiliateId: string;
    buyerId: string;
    orderId: string;
    riskId: string;
    nA: string;
    autoCookie: string;
    tableLoading: string;
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
    profileTitle: string;
    emailAffiliate: string;
    paymentAccount: string;
    deviceFingerprint: string;
    registeredIp: string;
    affiliateIdLabel: string;
    buyerEmailLabel: string;
    paymentLabel: string;
    ipLabel: string;
    countryLabel: string;
    fingerprintLabel: string;
    customerIdLabel: string;
    referrerLabel: string;
    emailMatch: string;
    paymentMatch: string;
    ipMatch: string;
    networkOptions: string;
    vpnOption: string;
    datacenterOption: string;
    resultTitle: string;
    totalScore: string;
    comparisonTitle: string;
    buyerInfo: string;
    affiliateProfile: string;
    signalsTitle: string;
    thresholdHint: string;
    noSignals: string;
    auditTitle: string;
    riskIdLabel: string;
    orderIdLabel: string;
    affiliateIdResultLabel: string;
    buyerIdLabel: string;
  };
  scenarios: {
    approve_clean: ScenarioEntry;
    pending_same_ip_vpn: ScenarioEntry;
    pending_disposable_vpn: ScenarioEntry;
    pending_referrer_spam: ScenarioEntry;
    pending_geo_vpn: ScenarioEntry;
    pending_ip_disposable: ScenarioEntry;
    manual_same_fingerprint: ScenarioEntry;
    manual_ip_datacenter_vpn: ScenarioEntry;
    manual_geo_referrer_vpn: ScenarioEntry;
    reject_self_referral: ScenarioEntry;
    reject_blacklisted_ip: ScenarioEntry;
    reject_duplicate_conversion: ScenarioEntry;
    reject_same_cookie: ScenarioEntry;
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
    affiliateIdLabel: string;
    buyerEmailLabel: string;
    paymentLabel: string;
    fingerprintSection: string;
    scanningFp: string;
    fingerprintHash: string;
    cookieId: string;
    autoCookie: string;
    resultTitle: string;
    totalScore: string;
    signalsTitle: string;
    cleanSignals: string;
    savedNote: string;
    suspenseLoading: string;
  };
  dashboard: {
    title: string;
    description: string;
    loadingOverlay: string;
    totalEvaluated: string;
    approved: string;
    pending: string;
    manual: string;
    rejected: string;
    filterLabel: string;
    filterAll: string;
    tableOrderTime: string;
    tableAffiliateBuyer: string;
    tableScoreDecision: string;
    tableSignals: string;
    tableReviewStatus: string;
    tableActions: string;
    noData: string;
    points: string;
    cleanSignals: string;
    reviewApproved: string;
    reviewRejected: string;
    reviewPending: string;
    detailTitle: string;
    comparisonTitle: string;
    buyerOrderInfo: string;
    affiliateProfile: string;
    signalsTreeTitle: string;
    noSignals: string;
    overrideTitle: string;
    approveBtn: string;
    approvingBtn: string;
    rejectBtn: string;
    rejectingBtn: string;
  };
  config: {
    title: string;
    description: string;
    loadingOverlay: string;
    thresholdsTitle: string;
    approveThreshold: string;
    approveRange: string;
    pendingThreshold: string;
    pendingRange: string;
    manualThreshold: string;
    manualRange: string;
    rejectThreshold: string;
    rejectRange: string;
    blacklistTitle: string;
    blacklistCount: string;
    typeIp: string;
    typeDomain: string;
    typeEmail: string;
    valuePlaceholder: string;
    reasonPlaceholder: string;
    addBtn: string;
    addingBtn: string;
    blacklistTableType: string;
    blacklistTableValue: string;
    blacklistTableReason: string;
    blacklistTableDelete: string;
    noBlacklist: string;
    deleteBtn: string;
    deletingBtn: string;
    enableBtn: string;
    disableBtn: string;
    enablingBtn: string;
    disablingBtn: string;
    pointsLabel: string;
  };
  decision: {
    APPROVE: { label: string; badge: string; filter: string; scoreRange: string };
    PENDING_REVIEW: { label: string; badge: string; filter: string; scoreRange: string };
    MANUAL_REVIEW: { label: string; badge: string; filter: string; scoreRange: string };
    REJECT: { label: string; badge: string; filter: string; scoreRange: string };
  };
  fraudReasons: {
    selfReferral: string;
    samePaymentAccount: string;
    sameCookie: string;
    sameFingerprint: string;
    hardwareClusterFingerprint: string;
    disposableEmail: string;
    sameIp: string;
    vpnUsage: string;
    datacenterIp: string;
    velocityExceeded: string;
    ipBlacklisted: string;
    referrerSpamBlacklisted: string;
    referrerCloaking: string;
    suspiciousGeolocation: string;
    clickInflationNoConversion: string;
    duplicateConversion: string;
  };
  refLanding: {
    loadingTitle: string;
    loadingBody: string;
    successTitle: string;
    successBody: string;
    collectedTitle: string;
    ref: string;
    fingerprintHash: string;
    cookieId: string;
    ipDevice: string;
    ipFallback: string;
    goToStore: string;
    navigating: string;
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
    points: 'điểm',
    enable: 'Bật',
    disable: 'Tắt',
    enabling: 'Đang bật...',
    disabling: 'Đang tắt...',
    add: 'Thêm',
    adding: 'Đang thêm...',
    delete: 'Xóa',
    deleting: 'Đang xóa...',
    detail: 'Chi tiết',
    approve: 'Duyệt',
    approving: 'Đang duyệt...',
    reject: 'Từ chối',
    rejecting: 'Đang từ chối...',
    all: 'Tất cả',
    score: 'Điểm',
    email: 'Email',
    paypal: 'PayPal',
    fingerprint: 'Fingerprint',
    ip: 'IP',
    cookieId: 'Cookie ID',
    affiliateId: 'Affiliate ID',
    buyerId: 'ID Người mua',
    orderId: 'Mã Đơn hàng',
    riskId: 'Mã Đánh giá',
    nA: 'N/A',
    autoCookie: 'Cookie tự động',
    tableLoading: 'Đang tải bảng...',
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
      'Bấm nút "Đăng ký thiết bị" ở trên để hệ thống ghi nhận Fingerprint thực tế của máy bạn làm thiết bị Affiliate chủ.',
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
    readyBody: 'Bấm nút "Đánh giá" để đối soát tất cả 15 thuật toán phòng chống gian lận.',
    loadingTitle: 'Đang đối soát Risk Engine...',
    loadingBody:
      'Hệ thống đang ghi nhận lượt click, đối soát 15 thuật toán Tapfiliate và tính điểm rủi ro cho kịch bản này.',
    profileTitle: 'Hồ sơ Người Giới thiệu Gốc (Affiliate Promoter Reference Profile)',
    emailAffiliate: 'Email Affiliate:',
    paymentAccount: 'Tài khoản Thanh toán:',
    deviceFingerprint: 'Vân tay Thiết bị:',
    registeredIp: 'IP Đăng ký:',
    affiliateIdLabel: 'ID Người giới thiệu (Affiliate ID)',
    buyerEmailLabel: 'Email Người mua hàng',
    paymentLabel: 'Tài khoản Thanh toán (PayPal / Thẻ)',
    ipLabel: 'Địa chỉ IP',
    countryLabel: 'Quốc gia (ISO)',
    fingerprintLabel: 'Vân tay Thiết bị',
    customerIdLabel: 'Mã Khách Hàng',
    referrerLabel: 'Trang Giới thiệu (Referrer URL)',
    emailMatch: 'Trùng Email Affiliate!',
    paymentMatch: 'Trùng PayPal Affiliate!',
    ipMatch: 'Trùng IP',
    networkOptions: 'Tùy chọn Mạng (Network Intelligence):',
    vpnOption: 'Phát hiện địa chỉ VPN thương mại (+20)',
    datacenterOption: 'IP thuộc Datacenter Cloud (+20)',
    resultTitle: 'Kết quả Đối soát Risk Engine',
    totalScore: 'Tổng Điểm Rủi Ro (Score)',
    comparisonTitle: 'Bảng Đối soát Trực quan: Người Mua vs Người Giới Thiệu',
    buyerInfo: 'Thông tin Người Mua:',
    affiliateProfile: 'Hồ sơ Affiliate (John Doe):',
    signalsTitle: 'Tín hiệu Gian lận Phát hiện ({count})',
    thresholdHint: 'Ngưỡng: <40 Duyệt | 40-69 Tạm giữ | 70-99 Manual | 100+ Từ chối',
    noSignals:
      'Không phát hiện tín hiệu trùng lặp gian lận nào với người giới thiệu. Giao dịch hợp lệ!',
    auditTitle: 'Thông tin Lưu vết CSDL (Audit Log):',
    riskIdLabel: 'Mã Đánh giá (Risk ID):',
    orderIdLabel: 'Mã Đơn hàng (Order ID):',
    affiliateIdResultLabel: 'Affiliate ID:',
    buyerIdLabel: 'ID Người mua:',
  },
  scenarios: {
    approve_clean: {
      name: 'Giao dịch sạch',
      description: 'Không kích hoạt rule gian lận nào.',
      expectedScore: '0 điểm',
    },
    pending_same_ip_vpn: {
      name: 'Trùng IP + VPN',
      description: 'Chỉ kích hoạt SAME_IP và VPN_USAGE.',
      expectedScore: '55 điểm',
    },
    pending_disposable_vpn: {
      name: 'Email rác + VPN',
      description: 'Chỉ kích hoạt DISPOSABLE_EMAIL và VPN_USAGE.',
      expectedScore: '50 điểm',
    },
    pending_referrer_spam: {
      name: 'Referrer spam + VPN',
      description: 'Chỉ kích hoạt REFERRER_SPAM_OR_CLOAKED và VPN_USAGE.',
      expectedScore: '50 điểm',
    },
    pending_geo_vpn: {
      name: 'Geo rủi ro + VPN',
      description: 'Chỉ kích hoạt SUSPICIOUS_GEOLOCATION và VPN_USAGE.',
      expectedScore: '50 điểm',
    },
    pending_ip_disposable: {
      name: 'Trùng IP + Email rác',
      description: 'Chỉ kích hoạt SAME_IP và DISPOSABLE_EMAIL.',
      expectedScore: '65 điểm',
    },
    manual_same_fingerprint: {
      name: 'Trùng vân tay thiết bị',
      description: 'Chỉ kích hoạt SAME_FINGERPRINT.',
      expectedScore: '70 điểm',
    },
    manual_ip_datacenter_vpn: {
      name: 'Trùng IP + Datacenter + VPN',
      description: 'Chỉ kích hoạt SAME_IP, DATACENTER_IP và VPN_USAGE.',
      expectedScore: '75 điểm',
    },
    manual_geo_referrer_vpn: {
      name: 'Geo + Referrer spam + VPN',
      description: 'Chỉ kích hoạt SUSPICIOUS_GEOLOCATION, REFERRER_SPAM_OR_CLOAKED và VPN_USAGE.',
      expectedScore: '80 điểm',
    },
    reject_self_referral: {
      name: 'Tự giới thiệu',
      description: 'Kích hoạt SELF_REFERRAL và SAME_PAYMENT_ACCOUNT.',
      expectedScore: '200 điểm',
    },
    reject_blacklisted_ip: {
      name: 'IP blacklist',
      description: 'Chỉ kích hoạt IP_BLACKLISTED.',
      expectedScore: '100 điểm',
    },
    reject_duplicate_conversion: {
      name: 'Trùng mã khách hàng',
      description: 'Cần bấm "Nạp dữ liệu" trước để có đơn cust_alice_101 trong CSDL.',
      expectedScore: '100 điểm',
    },
    reject_same_cookie: {
      name: 'Trùng cookie affiliate',
      description: 'Chỉ kích hoạt SAME_COOKIE.',
      expectedScore: '100 điểm',
    },
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
      'Bấm nút "Thanh toán" để mô phỏng một giao dịch thực tế. Kết quả đánh giá Risk Engine sẽ xuất hiện tại đây.',
    loadingTitle: 'Đang xử lý thanh toán...',
    loadingBody:
      'Risk Engine đang đánh giá giao dịch và ghi nhận kết quả vào CSDL Admin Audit Ledger.',
    affiliateIdLabel: 'Mã Người giới thiệu (Affiliate ID)',
    buyerEmailLabel: 'Email Người mua (Thử nhập email của bạn/đồng nghiệp)',
    paymentLabel: 'Tài khoản Thanh toán (Thẻ / PayPal)',
    fingerprintSection: 'FingerprintJS Thực tế Thu thập:',
    scanningFp: 'Đang quét phần cứng trình duyệt...',
    fingerprintHash: 'Fingerprint Hash:',
    cookieId: 'Cookie ID:',
    autoCookie: 'Cookie tự động',
    resultTitle: 'Kết quả Thanh toán & Risk Engine',
    totalScore: 'Tổng Điểm Rủi Ro',
    signalsTitle: 'Tín hiệu Gian lận Phát hiện ({count})',
    cleanSignals: 'Giao dịch hoàn toàn sạch! Không có tín hiệu trùng lặp vi phạm.',
    savedNote:
      'Giao dịch này đã được ghi lại trong CSDL Admin. Bạn có thể mở trang /admin/dashboard để đối soát!',
    suspenseLoading: 'Đang tải cửa hàng...',
  },
  dashboard: {
    title: 'Nhật ký Audit Điểm Rủi ro Affiliate (Admin Ledger)',
    description:
      'Đối soát toàn bộ giao dịch được đánh giá, soi chi tiết các tín hiệu gian lận và thực hiện ghi đè quyết định duyệt/từ chối hoa hồng.',
    loadingOverlay: 'Đang tải nhật ký audit...',
    totalEvaluated: 'Tổng Đã Đánh Giá',
    approved: 'Đã Duyệt (Approve)',
    pending: 'Tạm Giữ Chờ Duyệt',
    manual: 'Cần Kiểm Tra Thủ Công',
    rejected: 'Đã Từ Chối (Reject)',
    filterLabel: 'Lọc theo Quyết định:',
    filterAll: 'TẤT CẢ',
    tableOrderTime: 'Mã Đơn hàng / Thời gian',
    tableAffiliateBuyer: 'Affiliate & Người mua',
    tableScoreDecision: 'Điểm số & Quyết định',
    tableSignals: 'Các Tín hiệu Bất thường',
    tableReviewStatus: 'Trạng thái Review',
    tableActions: 'Thao tác',
    noData:
      'Chưa có bản ghi đánh giá điểm rủi ro nào. Hãy thử chạy kịch bản ở trang Giả lập hoặc bấm nút "Nạp dữ liệu".',
    points: 'điểm',
    cleanSignals: 'Sạch (0 tín hiệu)',
    reviewApproved: 'ĐÃ DUYỆT',
    reviewRejected: 'ĐÃ TỪ CHỐI',
    reviewPending: 'CHƯA DUYỆT',
    detailTitle: 'Chi tiết Audit Tín hiệu Gian lận',
    comparisonTitle: 'Bảng Đối soát: Người Mua vs Người Giới Thiệu',
    buyerOrderInfo: 'Thông tin Đơn hàng Người Mua:',
    affiliateProfile: 'Hồ sơ Gốc Affiliate (John Doe):',
    signalsTreeTitle: 'Cây Tín hiệu Gian lận & Giải thích Chi tiết:',
    noSignals: 'Không có tín hiệu gian lận nào.',
    overrideTitle: 'Thao tác Ghi đè Quyết định (Manual Override):',
    approveBtn: 'Duyệt',
    approvingBtn: 'Đang duyệt...',
    rejectBtn: 'Từ chối',
    rejectingBtn: 'Đang từ chối...',
  },
  config: {
    title: 'Cấu hình 15 Quy tắc & Danh sách Đen (Blacklist Manager)',
    description:
      'Điều chỉnh trọng số 15 thuật toán Tapfiliate Enterprise và quản lý Danh sách đen IP/Domain rủi ro cao.',
    loadingOverlay: 'Đang tải danh sách đen...',
    thresholdsTitle: 'Bảng Tham Chiếu Ngưỡng Quyết Định Hoa Hồng (Decision Thresholds)',
    approveThreshold: 'DUYỆT (APPROVE)',
    approveRange: 'Tổng điểm < 40 điểm',
    pendingThreshold: 'TẠM GIỮ (PENDING)',
    pendingRange: 'Tổng điểm 40 – 69 điểm',
    manualThreshold: 'KIỂM TRA THỦ CÔNG',
    manualRange: 'Tổng điểm 70 – 99 điểm',
    rejectThreshold: 'TỪ CHỐI (REJECT)',
    rejectRange: 'Tổng điểm ≥ 100 điểm',
    blacklistTitle: 'Quản lý Danh Sách Đen Bảo Mật (Attribute Blacklist)',
    blacklistCount: 'Đã thêm: {n} mục',
    typeIp: 'Địa chỉ IP (IP)',
    typeDomain: 'Tên miền (Domain)',
    typeEmail: 'Email (Email)',
    valuePlaceholder: 'Giá trị (VD: 198.51.100.99 hoặc spam-domain.biz)',
    reasonPlaceholder: 'Lý do chặn (VD: Click farm node)',
    addBtn: 'Thêm',
    addingBtn: 'Đang thêm...',
    blacklistTableType: 'Loại',
    blacklistTableValue: 'Giá trị Blacklist',
    blacklistTableReason: 'Lý do chặn',
    blacklistTableDelete: 'Xóa',
    noBlacklist: 'Chưa có giá trị blacklist nào.',
    deleteBtn: 'Xóa',
    deletingBtn: 'Đang xóa...',
    enableBtn: 'Bật',
    disableBtn: 'Tắt',
    enablingBtn: 'Đang bật...',
    disablingBtn: 'Đang tắt...',
    pointsLabel: 'Trọng số Điểm Cộng (+Points)',
  },
  decision: {
    APPROVE: {
      label: 'Đã duyệt',
      badge: 'DUYỆT HOA HỒNG (APPROVE - Giao dịch sạch)',
      filter: 'DUYỆT (APPROVE)',
      scoreRange: '< 40',
    },
    PENDING_REVIEW: {
      label: 'Tạm giữ',
      badge: 'TẠM GIỮ CHỜ DUYỆT (PENDING REVIEW)',
      filter: 'TẠM GIỮ',
      scoreRange: '40 – 69',
    },
    MANUAL_REVIEW: {
      label: 'Cần kiểm tra',
      badge: 'CẦN KIỂM TRA THỦ CÔNG (MANUAL REVIEW)',
      filter: 'KIỂM TRA THỦ CÔNG',
      scoreRange: '70 – 99',
    },
    REJECT: {
      label: 'Từ chối',
      badge: 'TỪ CHỐI HOA HỒNG (REJECT - Gian lận)',
      filter: 'TỪ CHỐI (REJECT)',
      scoreRange: '≥ 100',
    },
  },
  fraudReasons: {
    selfReferral: 'Email người mua ({buyerEmail}) trùng với Email người giới thiệu ({affiliateEmail})',
    samePaymentAccount:
      'Tài khoản thanh toán ({paymentAccount}) trùng với tài khoản Affiliate ({affiliatePayment}) hoặc đơn mua tự giới thiệu trước đó',
    sameCookie:
      'Cookie trình duyệt ({cookiePreview}) liên quan đến phiên quản trị Affiliate hoặc dùng chung nhiều tài khoản',
    sameFingerprint:
      'Vân tay thiết bị ({fingerprintPreview}) trùng khớp trực tiếp với thiết bị Affiliate ({affiliateFpPreview})',
    hardwareClusterFingerprint:
      'Phát hiện cụm thiết bị phần cứng trùng lặp (Cùng IP + Cùng OS {os} + Màn hình {screen}) giữa trình duyệt mới và máy Affiliate',
    disposableEmail: 'Tên miền email (@{domain}) thuộc danh sách nhà cung cấp email rác/tạm thời',
    sameIp: 'Địa chỉ IP ({ip}) trùng khớp với địa chỉ IP của Affiliate ({affiliateIp})',
    vpnUsage: 'Địa chỉ IP ({ip}) bị phát hiện là dịch vụ VPN thương mại',
    datacenterIp: 'Địa chỉ IP ({ip}) thuộc dải máy chủ Cloud Datacenter ASN',
    velocityExceeded:
      'Phát hiện tốc độ bất thường: {ordersLast10Min} đơn hàng từ IP {ip} trong 10 phút ({clicksLast5Min} click affiliate trong 5 phút)',
    ipBlacklisted:
      'Địa chỉ IP ({ip}) khớp với dải IP Đen động ({matchedPattern}): {blacklistReason}',
    referrerSpamBlacklisted:
      'Trang giới thiệu ({referrer}) thuộc mạng lưới Referrer Spam / Cloaking bị cấm: {blacklistReason}',
    referrerCloaking: 'Chuỗi Referrer dùng kỹ thuật ẩn giấu nguồn traffic (Url Cloaking)',
    suspiciousGeolocation:
      'Lượt nhấp/mua hàng đến từ quốc gia rủi ro cao ({country}) nằm ngoài thị trường mục tiêu',
    clickInflationNoConversion:
      'Affiliate tạo ra {clicks24h} lượt click trong 24h nhưng tỷ lệ chuyển đổi = 0% (Spam CTR ảo)',
    duplicateConversion: 'Mã khách hàng/đơn hàng ({externalCustomerId}) đã được ghi nhận hoa hồng trước đó',
  },
  refLanding: {
    loadingTitle: 'Đang Thu thập Fingerprint Thật...',
    loadingBody:
      'FingerprintJS đang đo đạc thông số phần cứng trình duyệt thực tế của thiết bị này.',
    successTitle: 'Đã Ghi Nhận Lượt Nhấp Link Thành Công!',
    successBody:
      'Thông số thiết bị thực tế của trình duyệt này đã được thu thập và lưu vào CSDL Risk Engine.',
    collectedTitle: 'Thông số Thiết bị Thực tế thu thập:',
    ref: 'Ref:',
    fingerprintHash: 'Fingerprint Hash Thật:',
    cookieId: 'Cookie ID:',
    ipDevice: 'IP Thiết bị:',
    ipFallback: 'Lấy từ IP Kết nối',
    goToStore: 'Chuyển đến cửa hàng',
    navigating: 'Đang chuyển...',
  },
};
