# Quick Deploy - Chạy nhanh trên Server

## Đã pull code về server, giờ chạy lệnh sau:

### Option 1: Chạy script tự động (KHUYẾN NGHỊ)

```bash
cd /var/www/nkdt/nkdt_be
bash deploy-server.sh
```

Script sẽ tự động:
- ✅ Kiểm tra và fix bảng Role_ → Role
- ✅ Xóa dữ liệu cũ (User, UserRole...)
- ✅ Tạo bảng SupportFile, SupportContent
- ✅ Install dependencies
- ✅ Generate Prisma Client
- ✅ Build project
- ✅ Seed database
- ✅ Kiểm tra UserRole có data
- ✅ Tạo thư mục uploads
- ✅ Restart service

---

### Option 2: Chạy từng lệnh thủ công

#### 1. Xóa dữ liệu cũ
```bash
docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db << 'EOF'
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM SupportFile;
DELETE FROM SupportContent;
DELETE FROM UserRole;
DELETE FROM User;
SET FOREIGN_KEY_CHECKS=1;
EOF
```

#### 2. Tạo bảng Support (nếu chưa có)
```bash
docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db << 'EOF'
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
EOF
```

#### 3. Install và build
```bash
npm install
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

#### 4. Seed database
```bash
npx prisma db seed
```

#### 5. Kiểm tra UserRole
```bash
docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db -e "
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

#### 6. Tạo thư mục uploads
```bash
mkdir -p uploads/support-files
chmod -R 755 uploads
```

#### 7. Restart service
```bash
docker compose down
docker compose up -d
docker compose logs -f nkdt-be
```

---

## Test API sau deploy

### 1. Health check
```bash
curl http://103.149.29.56:6062/health
```

### 2. Login Admin
```bash
curl -X POST http://103.149.29.56:6062/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin"}'
```

Phải trả về token.

### 3. Login User
```bash
curl -X POST http://103.149.29.56:6062/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com","password":"user123"}'
```

---

## Troubleshooting

### Lỗi: "Field role is required, got null"
```bash
# Xóa lại User và seed
docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db << 'EOF'
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM SupportFile;
DELETE FROM UserRole;
DELETE FROM User;
SET FOREIGN_KEY_CHECKS=1;
EOF

npx prisma db seed
```

### Lỗi: Prisma Client not generated
```bash
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

### Lỗi: Port 6062 already in use
```bash
docker compose down
docker compose up -d
```

### Kiểm tra logs lỗi
```bash
docker compose logs --tail=100 nkdt-be
```

---

## Credentials

**Admin:**
- Email: admin@gmail.com
- Password: admin

**User:**
- Email: user@gmail.com
- Password: user123
