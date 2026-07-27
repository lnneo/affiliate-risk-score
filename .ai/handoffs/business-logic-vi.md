# Tài Liệu Đặc Tả Nghiệp Vụ (Business Logic): LinkPul Affiliate Risk Score Engine

## 1. Tổng Quan & Mục Tiêu Nghiệp Vụ
- **Tên Hệ Thống**: LinkPul Affiliate Risk Scoring Engine (Động Cơ Tính Điểm Rủi Ro Tiếp Thị Liên Kết LinkPul).
- **Mục Tiêu**: Tự động phát hiện, tính điểm và ngăn chặn các hành vi gian lận tiếp thị liên kết (Tự mua hàng qua link cá nhân, Bot cày nhấp chuột ảo, Giả mạo thiết bị, Lạm dụng IP/Tên miền, Trùng mã chuyển đổi) tuân thủ 100% tài liệu [Tapfiliate Enterprise Anti-Fraud Specifications](https://support.tapfiliate.com/en/articles/5898063-fraud-prevention-monitoring-in-affiliate-marketing).
- **Đối Tượng Sử Dụng**: Nhà quản lý chương trình Affiliate (Affiliate Program Manager), Chuyên viên Kiểm toán Bảo mật Gian lận, Chủ doanh nghiệp E-commerce.

---

## 2. Ma Trận Phân Loại Ngưỡng Điểm Rủi Ro & Quyết Định Nghiệp Vụ

Hệ thống cộng dồn tổng trọng số điểm rủi ro từ các tín hiệu gian lận và tự động phân loại thành 4 quyết định nghiệp vụ:

| Khung Điểm Rủi Ro | Quyết Định Nghiệp Vụ | Hành Động Hệ Thống | Trạng Thái Chi Trả Hoa Hồng |
| :--- | :--- | :--- | :--- |
| **0 – 39 Điểm** | **`APPROVE` (Duyệt)** | Tự động duyệt chi trả hoa hồng cho Affiliate. Giao dịch hợp lệ. | `APPROVED` (Đã duyệt) |
| **40 – 69 Điểm** | **`PENDING_REVIEW` (Tạm giữ)** | Tạm giữ hoa hồng trong khoảng thời gian đối soát tiêu chuẩn. | `PENDING` (Đang chờ) |
| **70 – 99 Điểm** | **`MANUAL_REVIEW` (Kiểm tra thủ công)** | Gắn cờ cảnh báo rủi ro cao, đưa vào Nhật ký Audit Admin để xem xét thủ công. | `FLAGGED` (Bị gắn cờ) |
| **100+ Điểm** | **`REJECT` (Từ chối)** | Tự động từ chối hoa hồng do vi phạm trực tiếp quy tắc gian lận. | `REJECTED` (Đã từ chối) |

---

## 3. Chi Tiết Danh Mục 15 Quy Tắc Nghiệp Vụ Phòng Chống Gian Lận

### A. Nhóm Quy Tắc Định Danh & Tự Giới Thiệu (Identity & Self-Referral)
1. **`SELF_REFERRAL` (+100 điểm - Từ chối trực tiếp)**:
   - **Nghiệp vụ**: Affiliate cố tình mua hàng qua chính link giới thiệu của mình để hưởng hoa hồng.
   - **Điều kiện**: Email của người mua trùng với email đăng ký của Affiliate OR Mã người dùng (User ID) trùng với Affiliate ID.
2. **`SAME_PAYMENT_ACCOUNT` (+100 điểm - Từ chối trực tiếp)**:
   - **Nghiệp vụ**: Người mua hàng sử dụng đúng tài khoản thanh toán (Email PayPal, Vân tay thẻ tín dụng) mà Affiliate dùng để nhận hoa hồng.
   - **Điều kiện**: Tài khoản thanh toán người mua = Tài khoản nhận tiền của Affiliate.
3. **`SAME_COOKIE` (+100 điểm - Từ chối trực tiếp)**:
   - **Nghiệp vụ**: Session cookie của người mua trùng với phiên tạo link của Affiliate hoặc bị dùng chung giữa nhiều tài khoản người mua khác nhau.
4. **`SAME_FINGERPRINT` (+70 điểm - Cần duyệt thủ công)**:
   - **Nghiệp vụ**: Vân tay thiết bị trình duyệt (FingerprintJS OSS) của người mua trùng khớp với thiết bị cá nhân của Affiliate.
5. **`SAME_HARDWARE_CLUSTER` (+40 điểm - Tạm giữ/Duyệt thủ công)**:
   - **Nghiệp vụ**: Phát hiện tự giới thiệu đa trình duyệt trên cùng một máy tính vật lý (Ví dụ: Affiliate bấm link trên Chrome rồi mở Firefox mua hàng).
   - **Điều kiện**: `Trùng Địa chỉ IP` + `Trùng Hệ điều hành OS` + `Trùng Độ phân giải màn hình`.
6. **`DISPOSABLE_EMAIL` (+30 điểm)**:
   - **Nghiệp vụ**: Người mua sử dụng địa chỉ email rác/tạm thời (như tempmail, guerrillamail...) để tạo tài khoản mua hàng ảo.

---

### B. Nhóm Quy Tắc Mạng & Địa Chỉ IP (Network & IP Rules)
7. **`SAME_IP` (+35 điểm)**:
   - **Nghiệp vụ**: Địa chỉ IP của đơn hàng trùng với IP đăng ký quản trị hoặc IP click ban đầu của Affiliate.
8. **`IP_BLACKLISTED` (+100 điểm - Từ chối trực tiếp)**:
   - **Nghiệp vụ**: Địa chỉ IP của đơn hàng thuộc Danh sách đen bảo mật (Security Blacklist). Hỗ trợ kiểm tra IP tĩnh và dải IP động Wildcard Subnet (Ví dụ: `198.51.100.*`, `10.200.*.*`).
9. **`VPN_USAGE` (+20 điểm)**:
   - **Nghiệp vụ**: Traffic đơn hàng hoặc lượt click xuất phát từ các nhà mạng VPN thương mại.
10. **`DATACENTER_IP` (+20 điểm)**:
    - **Nghiệp vụ**: Traffic xuất phát từ dải IP máy chủ Datacenter Cloud (AWS, Google Cloud, DigitalOcean...).

---

### C. Nhóm Quy Tắc Hành Vi & Tần Suất (Behavior & Velocity Rules)
11. **`VELOCITY_EXCEEDED` (+20 điểm)**:
    - **Nghiệp vụ**: Tần suất nhấp link hoặc tạo đơn hàng tăng đột biến từ cùng một người mua/IP trong khoảng thời gian ngắn (5 phút).
12. **`CLICK_INFLATION_NO_CONVERSION` (+30 điểm)**:
    - **Nghiệp vụ**: Affiliate phát sinh >50 lượt nhấp link trong 24h nhưng tỷ lệ mua hàng = 0% (Hành vi gian lận Bot Spam CTR ảo).

---

### D. Nhóm Quy Tắc Trang Giới Thiệu, Mã Chuyển Đổi & Vị Trí Địa Lý (Referrer, Conversion & Geolocation)
13. **`REFERRER_SPAM_OR_CLOAKED` (+30 điểm)**:
    - **Nghiệp vụ**: Lượt nhấp đến từ tên miền rác bị cấm hoặc sử dụng kỹ thuật ẩn giấu nguồn gốc (URL Cloaking / `noreferrer`).
14. **`DUPLICATE_CONVERSION` (+100 điểm - Từ chối trực tiếp)**:
    - **Nghiệp vụ**: Mã khách hàng/đơn hàng (`external_customer_id`) đã từng được ghi nhận tính hoa hồng trước đó. Ngăn chặn gian lận nhận hoa hồng trùng lặp.
15. **`SUSPICIOUS_GEOLOCATION` (+30 điểm)**:
    - **Nghiệp vụ**: Đơn hàng xuất phát từ các quốc gia thuộc dải rủi ro cao nằm ngoài thị trường mục tiêu (Ví dụ: KP, RU, IR).

---

## PHỤ LỤC A: THƯ VIỆN NHẬN DIỆN VÂN TAY THIẾT BỊ (FINGERPRINT IDENTIFICATION APPENDIX)

### 1. Tổng Quan Về Thư Viện FingerprintJS OSS
Hệ thống **LinkPul** tích hợp thư viện trích xuất vân tay thiết bị **FingerprintJS (Open-Source Edition)** chạy trực tiếp trên Client-Side Trình duyệt. 

- **Mục Đích**: Định danh duy nhất thiết bị người dùng (Browser Visitor ID) dựa trên phần cứng và môi trường trình duyệt mà **không phụ thuộc vào Cookie** (Cookie-less Tracking). Nhờ đó, ngay cả khi người dùng xóa Cookie, đổi tài khoản hoặc duyệt web ở chế độ Ẩn danh (Incognito Mode), hệ thống vẫn có thể trích xuất mã định danh để phát hiện gian lận.

---

### 2. Các Tính Năng & Tín Hiệu Thu Thập Của Thư Viện (Captured Fingerprint Features)

Thư viện tổng hợp hơn 30 thông số môi trường phần cứng và trình duyệt để tạo ra mã Hash định danh duy nhất:

| Tính Năng / Tín Hiệu | Cơ Chế Thu Thập & Nguyên Lý Hoạt Động | Ứng Dụng Trong Phát Hiện Gian Lận |
| :--- | :--- | :--- |
| **1. Canvas Fingerprinting** | Vẽ một hình ảnh/văn bản ẩn trên đối tượng HTML5 Canvas và chuyển thành chuỗi Base64 Data URL. | Mỗi card màn hình GPU, driver đồ họa và font engine trên máy tính sẽ vẽ ra pixel hơi khác nhau, tạo nên mã định danh phần cứng cực kỳ chính xác. |
| **2. WebGL & GPU Fingerprinting** | Truy vấn thuộc tính WebGL `Unmasked Vendor` và `Unmasked Renderer` (VD: Apple M2, NVIDIA RTX 4070...). | Phát hiện chính xác loại card đồ họa GPU phần cứng và phát hiện các trình giả lập Bot (Headless Chrome/Puppeteer thường không có WebGL renderer thật). |
| **3. AudioContext Fingerprinting** | Khởi tạo bộ dao động âm thanh (Audio Oscillator) và đo phản ứng độ lệch tần số xử lý bởi soundcard. | Khai thác sự khác biệt nhỏ trong kiến trúc xử lý tín hiệu âm thanh phần cứng trên từng máy tính. |
| **4. Font Detection (Nhận diện Font)** | Đo đạc chiều rộng/chiều cao hiển thị của danh sách font chuẩn trên Canvas để phát hiện danh sách font được cài đặt trên máy. | Trích xuất bộ Font chữ riêng biệt đã được cài trên hệ điều hành của người dùng. |
| **5. Screen & Display Metrics** | Thu thập độ phân giải màn hình (`screen.width` x `screen.height`), độ sâu màu (Color Depth), tỷ lệ điểm ảnh màn hình (Device Pixel Ratio - DPR), hướng màn hình. | Phân biệt chính xác các dòng màn hình (VD: Màn hình Retina 2560x1600 vs Full HD 1920x1080). |
| **6. Môi trường CPU & RAM** | Truy vấn thuộc tính `navigator.hardwareConcurrency` (Số nhân CPU) và `navigator.deviceMemory` (Dung lượng RAM). | Xác định cấu hình phần cứng cốt lõi của máy tính. |
| **7. Môi trường Trình duyệt & Múi giờ** | Thu thập User-Agent, Múi giờ hệ thống (Timezone), Ngôn ngữ trình duyệt (Language/Locales), Trạng thái Touch Screen. | Phân biệt phiên bản hệ điều hành (macOS, Windows, iOS, Android) và vị trí múi giờ thực tế. |

---

### 3. Cơ Chế Đối Soát Cụm Phần Cứng Đa Trình Duyệt (Cross-Browser Hardware Clustering)

- **Thách Thức Kỹ Thuật**: Do FingerprintJS OSS trích xuất cả thông số của Engine Rendering (Chrome dùng Blink, Firefox dùng Gecko, Safari dùng WebKit), mã Hash Visitor ID trên Chrome và Firefox trên **cùng một máy tính vật lý** sẽ khác nhau.
- **Giải Pháp Nghiệp Vụ LinkPul**: 
  Hệ thống xây dựng thuật toán **Cụm Phần Cứng Đa Trình Duyệt (`SAME_HARDWARE_CLUSTER`)**:
  Combine: `Trùng IP Mạng` + `Trùng Hệ Điều Hành OS` + `Trùng Độ Phân Giải Màn Hình`.
  $\rightarrow$ Ngay cả khi Affiliate chuyển từ Chrome sang Firefox/Safari để tự giới thiệu mua hàng, hệ thống vẫn gắn cờ cảnh báo **`MANUAL_REVIEW` (+75 điểm)** để chặn gian lận triệt để!
