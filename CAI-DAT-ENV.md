# Lưu khóa cố định trên máy

Hướng dẫn này thay thế cách nhập khóa mỗi lần trong CAI-DAT-OPENAI.md.

1. Mở tệp `.env` cạnh `server.mjs` bằng Notepad hoặc trình soạn thảo.
2. Điền khóa OpenAI mới sau `OPENAI_API_KEY=`. Không thêm dấu cách hoặc gửi khóa qua chat.
3. Lưu đúng tên `.env`, không phải `.env.txt`.
4. Chạy `KHOI-DONG.cmd`, sau đó mở http://127.0.0.1:4174.
5. Mỗi lần sửa khóa, dừng máy chủ bằng Ctrl+C rồi chạy lại.

Ví dụ cấu trúc (không phải khóa thật):

```dotenv
OPENAI_API_KEY=dien_khoa_moi_o_day
OPENAI_MODEL=gpt-4.1-mini
```

Khóa được lưu dưới dạng văn bản trên ổ đĩa: người có quyền đọc tệp trên máy có thể đọc khóa. Máy chủ chỉ cho tải các tệp giao diện đã liệt kê, không cho tải `.env`. `.gitignore` đã loại trừ `.env` và `.env.*`, giữ lại `.env.example` không có khóa. Không nén hoặc gửi cả thư mục sau khi điền khóa; khi chuyển mã nguồn, loại bỏ `.env` và chỉ gửi `.env.example`. Khi hosting, nhập khóa vào secret/biến môi trường phía máy chủ của hosting.

Biến môi trường đã đặt sẵn trong tiến trình được ưu tiên hơn `.env`. Nếu máy chủ đang dùng khóa khác, kiểm tra biến môi trường OPENAI_API_KEY trên máy. Node.js 22 trở lên đọc `.env` bằng process.loadEnvFile; tài liệu: https://nodejs.org/api/process.html#processloadenvfilepath
