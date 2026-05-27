# JobTalk - OTT Messaging Application

**JobTalk** là một ứng dụng nhắn tin và gọi video đa nền tảng, 
được thiết kế để cung cấp trải nghiệm giao tiếp thời gian thực mượt mà và bảo mật.
---

## 🚀 Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | React Native, Expo |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Real-time** | Socket.io |
| **Video/Voice Call** | ZegoCloud SDK |
| **Authentication** | Vonage (OTP Verification) |

---

## ✨ Tính Năng Chính

*   **Nhắn tin thời gian thực**: Hỗ trợ nhắn tin cá nhân và nhóm qua Socket.io.
*   **Gọi Video/Audio**: Tích hợp gọi điện chất lượng cao với ZegoCloud.
*   **Xác thực người dùng**: Đăng ký và bảo mật tài khoản qua mã OTP.
*   **Quản lý dữ liệu**: Lưu trữ và truy xuất dữ liệu hiệu quả trên hệ thống MongoDB.
*   **Thông báo**: Hệ thống thông báo đẩy giúp người dùng không bỏ lỡ tin nhắn.

---

## 🛠 Hướng Dẫn Cài Đặt

Hướng dẫn chạy thử nghiệm trên thiết bị Androidl, hãy thực hiện các bước sau:

### 1. Clone dự án
git clone [https://github.com/sonbui719/cnm-ott-app.git](https://github.com/sonbui719/cnm-ott-app.git)
### 2. Cài đặt Backend
cd Backend
node server.js
### 3. Cài đặt Frontend
cd Frontend
npm install
# Tạo file .env và cấu hình BASE_URL (IP máy tính của bạn)
npx expo start --dev-client
🏗 Cấu Trúc Thư Mục
/Backend: Chứa mã nguồn server, API và cấu hình Database.

/Frontend: Chứa mã nguồn ứng dụng di động (React Native Expo).

🤝 Thành Viên Phát Triển
Bùi Trung Kiên - Lead Developer.

Nhóm 14 và các cộng tác viên dự án.

Lưu ý: Dự án đang trong quá trình phát triển và hoàn thiện thêm các tính năng bảo trì.
