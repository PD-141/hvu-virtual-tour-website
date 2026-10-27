# HVU Virtual Tour

## Chạy website

Yêu cầu Node.js 18 trở lên. Website có API quản trị để mật khẩu và số liệu không nằm trong mã JavaScript phía trình duyệt.

1. Mở terminal trong thư mục dự án.
2. Đặt biến môi trường `ADMIN_PASSWORD` thành mật khẩu quản trị. Trên PowerShell:

   ```powershell
   $env:ADMIN_PASSWORD="your-secret-password"
   node server.js
   ```

3. Mở `http://localhost:4173`.

Không nên dùng Live Server nếu muốn thống kê quản trị hoạt động, vì Live Server không chạy API `server.js`. Khi triển khai công khai, hãy đặt `ADMIN_PASSWORD` trong phần Environment Variables của dịch vụ hosting và dùng HTTPS.

## Ảnh panorama

Các ảnh hiện có được liệt kê trong `assets/floors.json`; thứ tự trong từng tầng đã sắp theo thời gian tệp và tên hiển thị là `Ảnh 1`, `Ảnh 2`, ... Trình xem sử dụng Pannellum 360°. Ảnh phải là panorama equirectangular 360° (thường tỷ lệ gần 2:1) để xem đủ vòng; ảnh thường vẫn mở được nhưng có thể méo hoặc không đủ góc nhìn.

## Nhạc nền

Tạo/đặt các file trong `assets/music/`. Mặc định là `assets/music/1.mp3`. Danh sách hiện được khai báo ở đầu phần Music trong `app.js`; nếu thêm bài mới, thêm một mục `{name:'Tên bài',src:'assets/music/tên-file.mp3'}` vào mảng `tracks`.

## Thống kê quản trị

Lượt mở panorama được gửi về `/api/view` và lưu trong `analytics-data.json` trên máy chủ. Dữ liệu chỉ được trả về sau khi máy chủ xác thực token quản trị. Đây là bảo vệ phía máy chủ, khác với việc chỉ làm mờ nội dung bằng CSS. Khi chạy nhiều bản server hoặc nhiều instance, nên chuyển dữ liệu sang cơ sở dữ liệu dùng chung.

## Ghi chú nội dung

Câu hỏi mini game dựa trên bộ câu hỏi người dùng cung cấp; câu về phường hành chính được gắn lưu ý cần đối chiếu thông tin hiện hành trước khi công bố.


Bản cập nhật: đã bỏ phần giới thiệu dự án và đồng hồ riêng; nhạc mặc định là CÒN GÌ ĐẸP HƠN, sau đó là Viết Tiếp Câu Chuyện Hòa Bình và Hào Khí Việt Nam. Danh sách nhạc nằm trong assets/music/. Có thanh âm lượng, tên bài đang phát và chế độ ẩn nội dung để ngắm nền; nút Quay lại khôi phục giao diện.


## Triển khai trên Vercel qua GitHub (v6-Vercel)

1. Đặt thư mục `hvu-virtual-tour-website` làm Root Directory trong Vercel nếu repository còn chứa thư mục cha.
2. Trong Vercel → Settings → Environment Variables, thêm `ADMIN_PASSWORD` (mật khẩu quản trị), `ADMIN_SESSION_SECRET` (chuỗi ngẫu nhiên dài tối thiểu 32 ký tự), `KV_REST_API_URL` và `KV_REST_API_TOKEN` từ một kho Redis tương thích Upstash/Vercel KV. Áp dụng cho Production và Preview nếu cần. Không dùng tiền tố `NEXT_PUBLIC_`.
3. Commit/push các file mới `api/`, `vercel.json`, `package.json` và thay đổi `app.js` lên GitHub. Vercel sẽ tạo deployment mới tự động.
4. Sau deployment, kiểm tra `/api/admin/verify` bằng cách dùng biểu mẫu quản trị trên website. Nếu hiện lỗi `analytics_storage_unavailable`, kiểm tra hai biến KV; nếu hiện lỗi cấu hình xác thực, kiểm tra hai biến ADMIN.

### API được chuyển sang Vercel Functions

- `POST /api/admin/verify` — xác minh mật khẩu và trả token ký HMAC có thời hạn 30 phút.
- `GET /api/admin/analytics` — chỉ trả dữ liệu nếu token hợp lệ.
- `POST /api/admin/reset` — xóa số liệu sau xác thực.
- `POST /api/view` — ghi nhận lượt mở ảnh.

Thống kê dùng một khóa JSON trong Redis REST (`hvu:analytics:v1`). Đây là bản triển khai đơn giản phù hợp lượng truy cập thấp; khi có nhiều lượt xem đồng thời, thao tác đọc-sửa-ghi có thể mất một số lượt tăng, nên chuyển sang các lệnh Redis nguyên tử hoặc cơ sở dữ liệu phù hợp nếu cần độ chính xác cao.
