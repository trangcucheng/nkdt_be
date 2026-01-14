# Hướng dẫn Deploy Backend lên Server

## 1. Chuẩn bị Server

### Yêu cầu:
- Node.js 16.x hoặc cao hơn
- MySQL 8.0 hoặc cao hơn
- PM2 (để chạy ứng dụng)

### Cài đặt dependencies:
```bash
# Cài Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài PM2
sudo npm install -g pm2
```

## 2. Cấu hình Environment Variables

**QUAN TRỌNG**: Phải tạo file `.env` trên server với các biến môi trường bắt buộc:

```bash
# Tạo file .env
nano .env
```

Nội dung file `.env` (copy từ `.env.example`):
```env
PORT=6062

DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=nkdt

DATABASE_URL="mysql://your_db_user:your_db_password@your_db_host:3306/nkdt"

# JWT_SECRET PHẢI được set (dùng string ngẫu nhiên mạnh)
JWT_SECRET=your_strong_secret_key_here

NODE_ENV=production
```

### Tạo JWT_SECRET mạnh:
```bash
# Linux/Mac
openssl rand -base64 32

# Hoặc dùng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 3. Build và Deploy

### A. Upload code lên server:
```bash
# Upload qua git
git clone your-repository-url
cd nkdt_be

# Hoặc upload qua scp/ftp
```

### B. Cài đặt dependencies:
```bash
npm install
```

### C. Chạy Prisma migrations:
```bash
npx prisma generate
npx prisma migrate deploy
```

### D. Seed database (nếu cần):
```bash
npm run seed
```

### E. Build project:
```bash
npm run build
```

### F. Start với PM2:
```bash
# Start app
pm2 start dist/src/main.js --name nkdt-backend

# Save PM2 configuration
pm2 save

# Enable auto-start on server reboot
pm2 startup
```

## 4. Kiểm tra logs

```bash
# Xem logs
pm2 logs nkdt-backend

# Xem status
pm2 status

# Restart app
pm2 restart nkdt-backend

# Stop app
pm2 stop nkdt-backend
```

## 5. Troubleshooting

### Lỗi "JWT_SECRET is not defined":
- **Nguyên nhân**: File `.env` không tồn tại hoặc thiếu biến `JWT_SECRET`
- **Giải pháp**: 
  1. Đảm bảo file `.env` tồn tại trong thư mục root của project
  2. Kiểm tra `JWT_SECRET` có giá trị hợp lệ
  3. Restart app: `pm2 restart nkdt-backend`

### Lỗi "DATABASE_URL is not defined":
- **Nguyên nhân**: Thiếu connection string database
- **Giải pháp**: 
  1. Thêm `DATABASE_URL` vào file `.env`
  2. Format: `mysql://user:password@host:port/database`

### Lỗi Prisma Connection:
```bash
# Test database connection
npx prisma db pull

# Regenerate Prisma Client
npx prisma generate
```

### App không start được:
```bash
# Check logs chi tiết
pm2 logs nkdt-backend --lines 100

# Check port đã được dùng chưa
sudo netstat -tulpn | grep 6062

# Restart app
pm2 restart nkdt-backend
```

## 6. Nginx Configuration (Optional)

Nếu dùng Nginx làm reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:6062;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 7. Docker Deploy (Alternative)

Nếu dùng Docker:

```bash
# Build image
docker build -t nkdt-backend .

# Run container
docker run -d \
  --name nkdt-backend \
  -p 6062:6062 \
  --env-file .env \
  nkdt-backend

# Check logs
docker logs -f nkdt-backend
```

## 8. Security Checklist

- ✅ Đổi `JWT_SECRET` thành giá trị mạnh và duy nhất
- ✅ Sử dụng HTTPS trong production
- ✅ Đặt `NODE_ENV=production`
- ✅ Giới hạn CORS origins trong `.env`
- ✅ Không commit file `.env` lên git
- ✅ Sử dụng strong password cho database
- ✅ Enable firewall cho server
- ✅ Regular backup database

## 9. Monitoring

```bash
# Setup PM2 monitoring
pm2 install pm2-logrotate

# Monitor real-time
pm2 monit

# Web monitoring
pm2 web
```

## 10. Update/Redeploy

```bash
# Pull latest code
git pull origin main

# Install dependencies (if changed)
npm install

# Run migrations (if any)
npx prisma migrate deploy

# Rebuild
npm run build

# Restart
pm2 restart nkdt-backend
```
