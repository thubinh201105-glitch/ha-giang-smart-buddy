# Cài OpenAI cho Smart Buddy

Bản này hỗ trợ hỏi bài AI qua máy chủ Node.js chạy trên máy của bạn. Trò chơi và góc tâm sự vẫn dùng nội dung mẫu. Chưa xuất bản máy chủ này lên internet.

## Bắt đầu

1. Cài Node.js phiên bản LTS từ https://nodejs.org nếu máy chưa có. Yêu cầu Node.js 22 trở lên.
2. Trong thư mục này, nhấp đúp **KHOI-DONG.cmd**. Đây là chương trình khởi động máy chủ; cần giữ cửa sổ mở trong lúc học.
3. Khi cửa sổ hỏi API key, nhập hoặc dán khóa OpenAI trực tiếp tại đó, rồi nhấn Enter. Ký tự được ẩn. Không gửi khóa cho trợ lý trong chat. Nếu nhấn Enter không nhập khóa, website vẫn chạy và báo thiếu khóa.
4. Mở http://127.0.0.1:4174 (khác bản giao diện cũ ở cổng 4173).
5. Chọn **Hỏi bài cùng Buddy**, chọn môn và cấp học, xác nhận từ 15 tuổi trở lên, nhập câu hỏi rồi gửi. Việc dùng API có thể phát sinh phí từ tài khoản OpenAI của bạn.
6. Khi xong, nhấn Ctrl+C trong cửa sổ máy chủ. Khóa không được ghi vào tệp, mã giao diện hoặc lịch sử lệnh; cần nhập lại khi khởi động lần sau.

## Bảo mật

Khóa được giữ trong biến môi trường của tiến trình máy chủ. Máy chủ chỉ phục vụ index.html, style.css và app.js; không cho tải tệp máy chủ, tệp cấu hình hoặc khóa. Không ghi nội dung hỏi đáp hoặc khóa vào nhật ký. Câu hỏi và câu trả lời được gửi OpenAI để xử lý và kiểm tra nội dung. `store:false` tắt lưu trạng thái Responses; không đồng nghĩa Zero Data Retention, nhà cung cấp vẫn có thể lưu dữ liệu theo chính sách của họ.

Tạo project và khóa riêng cho Buddy trong OpenAI Platform, đặt quyền tối thiểu cần thiết: ghi Responses và Moderations. Kiểm tra Billing và Usage của project. Nếu khóa từng bị chia sẻ, thu hồi và tạo khóa mới. Không đặt khóa trong HTML, JavaScript giao diện, URL hay thư mục công khai.

## Thông báo lỗi

| Trạng thái | Cách xử lý |
|---|---|
| Chưa cấu hình khóa | Dừng máy chủ và chạy KHOI-DONG.cmd để nhập khóa. |
| Khóa không hợp lệ hoặc đã bị thu hồi | Tạo hoặc dùng khóa project còn hiệu lực, khởi động lại. |
| Hết hạn mức / chưa có số dư API | Kiểm tra Billing, Usage và giới hạn tài khoản. Gói ChatGPT không thay thế số dư API. |
| Giới hạn tốc độ | Chờ một phút; bản này giới hạn 6 câu/phút và 2 câu xử lý đồng thời. |
| Chưa có quyền | Kiểm tra quyền khóa cho Responses và Moderations. |
| Mô hình không khả dụng | Kiểm tra tài khoản có quyền dùng gpt-4.1-mini; OPENAI_MODEL có thể được cấu hình ở máy chủ. |
| Kết nối lỗi / quá thời gian | Kiểm tra mạng, giữ cửa sổ máy chủ mở, rồi thử lại. |

Máy chủ kiểm tra nội dung đầu vào và đầu ra bằng Moderations. AI có thể trả lời sai; cần đối chiếu sách và thầy cô. Bản AI này giới hạn từ 15 tuổi, không phải hệ thống xác minh tuổi đầy đủ. Trước khi cho học sinh nhỏ hơn sử dụng hoặc triển khai rộng, cần kiểm tra quy định tuổi đồng ý số và dữ liệu trẻ em; `store:false` không thay thế yêu cầu ZDR đối với dữ liệu cá nhân của trẻ dưới tuổi quy định.

## Khi đưa lên Netlify

Không tải cả thư mục này lên Netlify Drop: Drop chỉ phục vụ giao diện tĩnh và không chạy server.mjs. Muốn dùng AI công khai, cần chuyển máy chủ thành Netlify Function, cấu hình OPENAI_API_KEY trong mục Environment variables với phạm vi Functions, rồi triển khai Function bằng CLI hoặc quy trình build. Không triển khai khóa cùng mã nguồn. Máy chủ hiện tại chỉ chạy cục bộ; không mở cổng ra internet.

## Tài liệu chính thức đã đối chiếu

- Responses: https://developers.openai.com/api/docs/guides/migrate-to-responses
- Mô hình: https://developers.openai.com/api/docs/models/gpt-4.1-mini
- Lỗi API: https://developers.openai.com/api/docs/guides/error-codes
- Người dưới 18 tuổi: https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance
- Bảo mật môi trường Netlify Functions: https://docs.netlify.com/build/functions/environment-variables/
