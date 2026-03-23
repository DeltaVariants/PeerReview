# Peer Review System

Hệ thống đánh giá nội bộ cho team - Thu thập feedback và đo lường đóng góp một cách công bằng.

## Tính năng

### Leader
- ✅ Đăng nhập với mật khẩu
- ✅ Tạo form peer review
- ✅ Chia sẻ link cho team
- ✅ Xem báo cáo kết quả với ranking và % đóng góp

### Member
- ✅ Truy cập form qua link
- ✅ Chọn tên từ danh sách
- ✅ Phân bổ 100 điểm cho các thành viên khác
- ✅ Submit đánh giá (mỗi người chỉ 1 lần)

## Công nghệ

- **Next.js 16.2.1** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **MongoDB (Mongoose)** - Persistent database storage

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd peer_review
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env.local`:
```bash
LEADER_PASSWORD=your_password_here

# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/peer_review?retryWrites=true&w=majority
```

**Lưu ý:** Bạn cần tạo MongoDB database trước (xem phần Deploy để biết cách setup MongoDB Atlas miễn phí)

4. Chạy development server:
```bash
npm run dev
```

5. Mở [http://localhost:3000](http://localhost:3000)

## Cấu trúc dự án

```
peer_review/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/login/         # Leader authentication
│   │   ├── forms/              # Form CRUD
│   │   └── reviews/            # Submit reviews
│   ├── leader/                 # Leader pages
│   │   ├── login/              # Login page
│   │   └── forms/              # Dashboard, create, report
│   └── review/                 # Member pages
│       └── [formId]/           # Select member & scoring
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── db.ts                   # JSON file operations
│   ├── utils.ts                # Validation & calculations
│   └── auth.ts                 # Authentication utilities
└── data/
    └── forms/                  # JSON storage
```

## Quy trình sử dụng

### 1. Leader tạo form
1. Đăng nhập tại `/leader/login`
2. Vào Dashboard `/leader/forms`
3. Click "Tạo Form Mới"
4. Nhập:
   - Tên form (ví dụ: "Team A - Sprint 5 Review")
   - Số lượng thành viên (tối thiểu 2)
   - Danh sách tên thành viên (không trùng lặp)
5. Nhận share link: `/review/{formId}`

### 2. Member chấm điểm
1. Truy cập link share
2. Chọn tên của mình từ dropdown
3. Phân bổ 100 điểm cho các thành viên khác:
   - Sử dụng slider hoặc nhập số
   - Tổng phải = 100
   - Không chấm bản thân
4. Submit đánh giá

### 3. Leader xem báo cáo
1. Vào Dashboard
2. Click "Xem Report" trên form
3. Xem:
   - Bảng xếp hạng
   - Tổng điểm mỗi người
   - % đóng góp
   - Danh sách đã/chưa submit

## Business Rules

### Form Creation
- Tên thành viên phải unique
- Tối thiểu 2 thành viên
- Tên form không được trống

### Review Submission
- Mỗi member chỉ submit 1 lần
- Không được chấm điểm cho bản thân
- Phải chấm tất cả thành viên khác
- Tổng điểm phải = 100
- Điểm mỗi người: 0-100

## API Routes

### Forms
- `POST /api/forms` - Tạo form mới
- `GET /api/forms` - Lấy danh sách forms
- `GET /api/forms/[formId]` - Lấy chi tiết form
- `GET /api/forms/[formId]/available-members` - Lấy members chưa submit
- `GET /api/forms/[formId]/report` - Lấy báo cáo

### Reviews
- `POST /api/reviews` - Submit review

### Auth
- `POST /api/auth/login` - Leader login

## Deploy lên Vercel

### Bước 1: Tạo MongoDB Database (MongoDB Atlas - Free)
1. Đăng nhập vào [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Tạo **Free Cluster** (M0 - 512MB storage miễn phí)
3. Chọn **Cloud Provider** và **Region** gần bạn nhất
4. Click **Create Cluster**
5. Tạo **Database User**:
   - Username và Password (lưu lại để dùng trong connection string)
6. Whitelist IP:
   - Click **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
7. Lấy **Connection String**:
   - Click **Connect** → **Connect your application**
   - Copy connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/peer_review?retryWrites=true&w=majority`
   - Thay `<username>` và `<password>` bằng credentials của bạn

### Bước 2: Deploy Project lên Vercel
1. Push code lên GitHub
2. Import project vào [Vercel](https://vercel.com/new)
3. Trong **Environment Variables**, thêm:
   - `LEADER_PASSWORD` = mật khẩu leader của bạn
   - `MONGODB_URI` = connection string từ MongoDB Atlas
4. Click **Deploy**

### Lưu ý
- MongoDB Atlas **free tier**: 512MB storage, đủ cho hầu hết use cases
- Dữ liệu được lưu trữ persistent, không mất khi redeploy
- Connection pooling được handle tự động bởi Mongoose

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## License

MIT
