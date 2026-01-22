# Hướng dẫn Deploy Backend lên Server

## Bước 1: Backup Database Server trước khi deploy

```bash
# SSH vào server
ssh root@103.149.29.56

# Backup database
docker compose exec nkdt-db mysqldump -u root -p nkdt_db > backup_$(date +%Y%m%d_%H%M%S).sql
# Nhập password khi được hỏi
```

## Bước 2: Xử lý vấn đề Role table trên server

### 2.1. Kiểm tra tên bảng Role hiện tại
```bash
docker compose exec nkdt-db mysql -u root -p nkdt_db -e "SHOW TABLES LIKE 'Role%';"
```

### 2.2. Nếu bảng là `Role_`, đổi tên thành `Role`
```bash
docker compose exec nkdt-db mysql -u root -p nkdt_db << 'EOF'
SET FOREIGN_KEY_CHECKS=0;
RENAME TABLE `Role_` TO `Role`;
SET FOREIGN_KEY_CHECKS=1;
EOF
```

## Bước 3: Xóa dữ liệu cũ và chuẩn bị clean database

```bash
# Kết nối vào MySQL container
docker compose exec nkdt-db mysql -u root -p nkdt_db

# Trong MySQL shell, chạy các lệnh sau:
```

```sql
-- Xóa tất cả dữ liệu liên quan đến User
SET FOREIGN_KEY_CHECKS=0;

DELETE FROM SupportFile;
DELETE FROM SupportContent;
DELETE FROM DiaryComment;
DELETE FROM DiaryReaction;
DELETE FROM Diary;
DELETE FROM EmotionAlert;
DELETE FROM IdeologicalWorkNote;
DELETE FROM LoginHistory;
DELETE FROM UserRole;
DELETE FROM User;

SET FOREIGN_KEY_CHECKS=1;

-- Kiểm tra
SELECT COUNT(*) as user_count FROM User;
SELECT COUNT(*) as userrole_count FROM UserRole;
```

Gõ `exit` để thoát khỏi MySQL shell.

## Bước 4: Kiểm tra và tạo bảng SupportFile, SupportContent nếu chưa có

```bash
# Kiểm tra bảng SupportFile có tồn tại chưa
docker compose exec nkdt-db mysql -u root -p nkdt_db -e "SHOW TABLES LIKE 'Support%';"
```

Nếu chưa có, chạy migration:

```bash
# Tạo file migration trên server
cat > /tmp/add_support_tables.sql << 'EOF'
-- CreateTable
CREATE TABLE IF NOT EXISTS `SupportContent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` ENUM('EMOTION_MANAGEMENT', 'ADAPTATION_SKILLS', 'MOTIVATION', 'STUDY_TIPS', 'WORK_SKILLS', 'HEALTH_WELLNESS') NOT NULL,
    `content` TEXT NOT NULL,
    `summary` VARCHAR(500) NULL,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportContent_uploadedBy_fkey`(`uploadedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `SupportFile` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `fileName` VARCHAR(500) NOT NULL,
    `filePath` VARCHAR(1000) NOT NULL,
    `fileSize` BIGINT NOT NULL,
    `fileType` VARCHAR(100) NOT NULL,
    `category` ENUM('EMOTION_MANAGEMENT', 'ADAPTATION_SKILLS', 'MOTIVATION', 'STUDY_TIPS', 'WORK_SKILLS', 'HEALTH_WELLNESS') NOT NULL,
    `description` TEXT NULL,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportFile_uploadedBy_fkey`(`uploadedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SupportContent` ADD CONSTRAINT `SupportContent_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportFile` ADD CONSTRAINT `SupportFile_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
EOF

# Chạy migration
docker compose exec -T nkdt-db mysql -u root -p nkdt_db < /tmp/add_support_tables.sql
```

## Bước 5: Deploy code mới lên server

### 5.1. Push code lên Git (từ local)
```bash
cd C:\Users\Admin\Desktop\Workspace\nkdt_be

git status
git add .
git commit -m "feat: add support file management with clean database"
git push origin main
```

### 5.2. Pull code trên server
```bash
# SSH vào server
ssh root@103.149.29.56

cd /var/www/nkdt/nkdt_be

# Backup code cũ
cp -r . ../nkdt_be_backup_$(date +%Y%m%d_%H%M%S)

# Pull code mới
git pull origin main
```

## Bước 6: Cài đặt dependencies và build

```bash
# Trên server
cd /var/www/nkdt/nkdt_be

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build project
npm run build
```

## Bước 7: Seed database trên server

```bash
# Trên server
cd /var/www/nkdt/nkdt_be

# Run seed
npx prisma db seed
```

Kiểm tra kết quả:
- Phải thấy: `✅ Admin user seeded. Email: admin@gmail.com / Password: admin`
- Phải thấy: `✅ Client user seeded. Email: user@gmail.com / Password: user123`

## Bước 8: Kiểm tra dữ liệu sau seed

```bash
docker compose exec nkdt-db mysql -u root -p nkdt_db -e "
SELECT u.email, r.name as role 
FROM User u 
LEFT JOIN UserRole ur ON u.id = ur.userId 
LEFT JOIN Role r ON ur.roleId = r.id;
"
```

Phải thấy:
```
+-------------------+-------+
| email             | role  |
+-------------------+-------+
| admin@gmail.com   | ADMIN |
| user@gmail.com    | USER  |
+-------------------+-------+
```

## Bước 9: Restart backend service

```bash
# Trên server
cd /var/www/nkdt/nkdt_be

# Stop container
docker compose down

# Start lại
docker compose up -d

# Xem logs
docker compose logs -f nkdt-be
```

## Bước 10: Tạo thư mục uploads

```bash
# Trên server
mkdir -p /var/www/nkdt/nkdt_be/uploads/support-files
chown -R node:node /var/www/nkdt/nkdt_be/uploads
chmod -R 755 /var/www/nkdt/nkdt_be/uploads
```

## Bước 11: Test API

```bash
# Test health check
curl http://103.149.29.56:6062/health

# Test login
curl -X POST http://103.149.29.56:6062/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin"}'
```

## Bước 12: Deploy Frontend (nếu cần)

```bash
# Từ local
cd C:\Users\Admin\Desktop\Workspace\nkdt_fe

# Build frontend
npm run build

# Deploy lên server
scp -r ./build/* root@103.149.29.56:/var/www/nkdt/nkdt_fe/
```

## Troubleshooting

### Nếu gặp lỗi "Field role is required, got null"
```bash
# Xóa sạch User và UserRole, chạy lại seed
docker compose exec nkdt-db mysql -u root -p nkdt_db << 'EOF'
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM SupportFile;
DELETE FROM UserRole;
DELETE FROM User;
SET FOREIGN_KEY_CHECKS=1;
EOF

npx prisma db seed
```

### Nếu Prisma Client báo lỗi
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Nếu migration bị conflict
```bash
# Reset migration history (NGUY HIỂM - chỉ dùng khi cần)
npx prisma migrate reset --force
npx prisma db seed
```

## Checklist hoàn thành

- [ ] Backup database server
- [ ] Đổi tên bảng Role_ thành Role (nếu cần)
- [ ] Xóa dữ liệu cũ (User, UserRole...)
- [ ] Tạo bảng SupportFile, SupportContent
- [ ] Push code lên Git
- [ ] Pull code trên server
- [ ] Install dependencies
- [ ] Generate Prisma Client
- [ ] Build project
- [ ] Run seed
- [ ] Kiểm tra UserRole có data
- [ ] Restart backend service
- [ ] Tạo thư mục uploads
- [ ] Test login API
- [ ] Deploy frontend

## Credentials sau deploy

**Admin:**
- Email: admin@gmail.com
- Password: admin

**User:**
- Email: user@gmail.com
- Password: user123
