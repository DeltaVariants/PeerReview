# Hướng dẫn Deploy lên Vercel

## Vấn đề đã fix

**Lỗi 500 khi tạo form/submit review trên Vercel** đã được fix bằng cách:
- ❌ **Trước:** Sử dụng file system (`fs`) để lưu trữ → Read-only trên Vercel
- ✅ **Sau:** Sử dụng MongoDB (Mongoose) → Persistent database storage

## Bước 1: Setup MongoDB Atlas Database (Free)

### 1.1. Tạo MongoDB Cluster
1. Đăng ký/Đăng nhập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Click **Build a Database**
3. Chọn **M0 FREE** tier:
   - **Cloud Provider:** AWS, Google Cloud, hoặc Azure
   - **Region:** Chọn gần bạn nhất (ví dụ: Singapore, Tokyo)
4. **Cluster Name:** `peer-review-cluster` (hoặc tên bạn muốn)
5. Click **Create**

### 1.2. Tạo Database User
1. Trong **Security** → **Database Access**
2. Click **Add New Database User**
3. Chọn **Password** authentication
4. Điền:
   - **Username:** `peer_review_user`
   - **Password:** Tạo password mạnh (lưu lại)
5. **Database User Privileges:** Read and write to any database
6. Click **Add User**

### 1.3. Whitelist IP Address
1. Trong **Security** → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Cần thiết cho Vercel serverless functions
4. Click **Confirm**

### 1.4. Lấy Connection String
1. Click **Connect** trên cluster của bạn
2. Chọn **Connect your application**
3. **Driver:** Node.js, **Version:** 4.1 or later
4. Copy connection string:
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/peer_review?retryWrites=true&w=majority
```
5. Thay thế:
   - `<username>` → `peer_review_user`
   - `<password>` → password bạn đã tạo
   - Database name: `peer_review`

## Bước 2: Deploy Project

### 2.1. Push Code lên GitHub
```bash
git add .
git commit -m "Migrate to MongoDB storage"
git push origin main
```

### 2.2. Import vào Vercel
1. Vào [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Chọn repository GitHub của bạn
4. Click **Import**

### 2.3. Configure Environment Variables
Trong phần **Environment Variables**, thêm:

**Required:**
- `LEADER_PASSWORD` = `your_secure_password`
- `MONGODB_URI` = connection string từ MongoDB Atlas (Bước 1.4)

Ví dụ:
```
LEADER_PASSWORD=MySecurePassword123
MONGODB_URI=mongodb+srv://peer_review_user:MyPassword123@cluster.mongodb.net/peer_review?retryWrites=true&w=majority
```

### 2.4. Deploy
Click **Deploy** và đợi build hoàn tất.

## Bước 3: Verify Deployment

### 3.1. Test các chức năng
1. **Login:** Truy cập `https://your-app.vercel.app/leader/login`
2. **Tạo form:** Tạo một form mới
3. **Submit review:** Truy cập link review và submit
4. **Xem report:** Kiểm tra báo cáo

### 3.2. Check Logs
Nếu gặp lỗi, xem logs tại:
- Vercel Dashboard → Project → Deployments → Click deployment → **Runtime Logs**

## Development Local với MongoDB

### Option 1: Sử dụng MongoDB Atlas (Recommended)
1. Sử dụng cùng MongoDB Atlas cluster đã tạo ở Bước 1
2. Tạo file `.env.local`:
```bash
LEADER_PASSWORD=your_password
MONGODB_URI=mongodb+srv://peer_review_user:password@cluster.mongodb.net/peer_review?retryWrites=true&w=majority
```
3. Run: `npm run dev`

### Option 2: Sử dụng MongoDB Local
1. Cài đặt [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
```bash
# Windows
net start MongoDB

# macOS/Linux
brew services start mongodb-community
# hoặc
sudo systemctl start mongod
```
3. Tạo file `.env.local`:
```bash
LEADER_PASSWORD=your_password
MONGODB_URI=mongodb://localhost:27017/peer_review
```
4. Run: `npm run dev`

### Option 3: Sử dụng Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run dev
npm run dev
```

## Troubleshooting

### Lỗi: "Please define the MONGODB_URI environment variable"
**Nguyên nhân:** Thiếu MONGODB_URI trong environment variables

**Giải pháp:**
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm `MONGODB_URI` với connection string từ MongoDB Atlas
3. Redeploy

### Lỗi: "MongoServerError: bad auth"
**Nguyên nhân:** Username hoặc password sai trong connection string

**Giải pháp:**
1. Kiểm tra lại username/password trong MongoDB Atlas
2. Đảm bảo password không chứa ký tự đặc biệt (hoặc URL encode)
3. Update `MONGODB_URI` với credentials đúng
4. Redeploy

### Lỗi: "MongooseServerSelectionError: connect ETIMEDOUT"
**Nguyên nhân:** IP chưa được whitelist hoặc network issue

**Giải pháp:**
1. MongoDB Atlas → Network Access
2. Đảm bảo có entry `0.0.0.0/0` (Allow from anywhere)
3. Đợi vài phút để thay đổi có hiệu lực
4. Redeploy

### Lỗi 500 vẫn còn
**Nguyên nhân:** Code chưa được deploy hoặc cache cũ

**Giải pháp:**
1. Check Runtime Logs: Vercel Dashboard → Deployments → Runtime Logs
2. Force redeploy: Vercel Dashboard → Deployments → Redeploy
3. Clear cache: Settings → Clear Cache

## Migration Data từ File System

Nếu bạn có data cũ trong `data/forms/*.json`, bạn có thể migrate sang MongoDB:

### Option 1: Manual Import via MongoDB Compass
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect với connection string
3. Tạo database `peer_review` và collection `forms`
4. Import JSON files

### Option 2: Script Migration
Tạo file `scripts/migrate-to-mongodb.ts`:
```typescript
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { FormModel } from '../lib/models';

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const dataDir = path.join(process.cwd(), 'data', 'forms');
  const files = fs.readdirSync(dataDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
      await FormModel.create(data);
      console.log(`Migrated: ${file}`);
    }
  }
  
  await mongoose.disconnect();
  console.log('Migration complete!');
}

migrate();
```

Run: `npx tsx scripts/migrate-to-mongodb.ts`

## Limits của Free Tier (MongoDB Atlas M0)

- **Storage:** 512 MB
- **RAM:** 512 MB shared
- **Connections:** 500 concurrent
- **Bandwidth:** Unlimited

Đủ cho hầu hết use cases của peer review system. Có thể scale lên paid tier khi cần.

## Next Steps

Sau khi deploy thành công:
1. ✅ Test tất cả chức năng
2. ✅ Setup custom domain (optional)
3. ✅ Enable analytics (optional)
4. ✅ Setup monitoring/alerts (optional)
