#!/bin/bash
# Script deploy backend lên server
# Chạy trên server: bash deploy-server.sh

set -e  # Exit on error

echo "======================================"
echo "🚀 DEPLOY BACKEND TO SERVER"
echo "======================================"

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Bước 1: Kiểm tra bảng Role
echo -e "\n${YELLOW}📊 Bước 1: Kiểm tra bảng Role...${NC}"
ROLE_TABLE=$(docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db -e "SHOW TABLES LIKE 'Role%';" | grep -v "Tables_in")

if echo "$ROLE_TABLE" | grep -q "Role_"; then
    echo -e "${YELLOW}⚠️  Phát hiện bảng Role_, đổi tên thành Role...${NC}"
    docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db << 'EOF'
SET FOREIGN_KEY_CHECKS=0;
RENAME TABLE `Role_` TO `Role`;
SET FOREIGN_KEY_CHECKS=1;
EOF
    echo -e "${GREEN}✅ Đã đổi tên bảng Role_ thành Role${NC}"
else
    echo -e "${GREEN}✅ Bảng Role đã đúng${NC}"
fi

# Bước 2: Xóa dữ liệu cũ
echo -e "\n${YELLOW}🗑️  Bước 2: Xóa dữ liệu cũ...${NC}"
docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db << 'EOF'
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
EOF
echo -e "${GREEN}✅ Đã xóa dữ liệu cũ${NC}"

# Bước 3: Kiểm tra và tạo bảng SupportFile, SupportContent
echo -e "\n${YELLOW}📋 Bước 3: Kiểm tra bảng Support...${NC}"
SUPPORT_TABLES=$(docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db -e "SHOW TABLES LIKE 'Support%';" | grep -v "Tables_in" | wc -l)

if [ "$SUPPORT_TABLES" -lt 2 ]; then
    echo -e "${YELLOW}⚠️  Tạo bảng SupportFile và SupportContent...${NC}"
    
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

    docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db < /tmp/add_support_tables.sql
    rm /tmp/add_support_tables.sql
    echo -e "${GREEN}✅ Đã tạo bảng Support${NC}"
else
    echo -e "${GREEN}✅ Bảng Support đã tồn tại${NC}"
fi

# Bước 4: Install dependencies
echo -e "\n${YELLOW}📦 Bước 4: Install dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Install dependencies thành công${NC}"

# Bước 5: Generate Prisma Client
echo -e "\n${YELLOW}⚙️  Bước 5: Generate Prisma Client...${NC}"
rm -rf node_modules/.prisma
npx prisma generate
echo -e "${GREEN}✅ Generate Prisma Client thành công${NC}"

# Bước 6: Build project
echo -e "\n${YELLOW}🔨 Bước 6: Build project...${NC}"
npm run build
echo -e "${GREEN}✅ Build thành công${NC}"

# Bước 7: Seed database
echo -e "\n${YELLOW}🌱 Bước 7: Seed database...${NC}"
npx prisma db seed
echo -e "${GREEN}✅ Seed thành công${NC}"

# Bước 8: Kiểm tra UserRole
echo -e "\n${YELLOW}🔍 Bước 8: Kiểm tra UserRole...${NC}"
docker compose exec -T nkdt-db mysql -u root -ptrangtrang nkdt_db << 'EOF'
SELECT 
    u.email,
    r.name as role,
    COUNT(ur.id) as role_count
FROM User u 
LEFT JOIN UserRole ur ON u.id = ur.userId 
LEFT JOIN Role r ON ur.roleId = r.id
GROUP BY u.id, u.email, r.name;
EOF

# Bước 9: Tạo thư mục uploads
echo -e "\n${YELLOW}📁 Bước 9: Tạo thư mục uploads...${NC}"
mkdir -p uploads/support-files
chmod -R 755 uploads
echo -e "${GREEN}✅ Đã tạo thư mục uploads${NC}"

# Bước 10: Restart service
echo -e "\n${YELLOW}🔄 Bước 10: Restart service...${NC}"
docker compose down
docker compose up -d
echo -e "${GREEN}✅ Service đã restart${NC}"

# Đợi service khởi động
echo -e "\n${YELLOW}⏳ Đợi service khởi động (10s)...${NC}"
sleep 10

# Kiểm tra logs
echo -e "\n${YELLOW}📋 Logs của service:${NC}"
docker compose logs --tail=20 nkdt-be

echo -e "\n${GREEN}======================================"
echo "✅ DEPLOY HOÀN TẤT!"
echo "======================================${NC}"
echo ""
echo "📝 Thông tin đăng nhập:"
echo "  Admin: admin@gmail.com / admin"
echo "  User:  user@gmail.com / user123"
echo ""
echo "🧪 Test API:"
echo "  curl http://103.149.29.56:6062/health"
echo "  curl -X POST http://103.149.29.56:6062/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"admin@gmail.com\",\"password\":\"admin\"}'"
echo ""
