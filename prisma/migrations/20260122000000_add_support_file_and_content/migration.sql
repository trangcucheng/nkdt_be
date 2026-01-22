-- CreateTable
CREATE TABLE `SupportContent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `category` ENUM('EMOTION_MANAGEMENT', 'ADAPTATION_SKILLS', 'MOTIVATION', 'STUDY_TIPS', 'WORK_SKILLS', 'HEALTH_WELLNESS') NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportContent_category_idx`(`category`),
    INDEX `SupportContent_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportFile` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileSize` BIGINT NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `category` ENUM('EMOTION_MANAGEMENT', 'ADAPTATION_SKILLS', 'MOTIVATION', 'STUDY_TIPS', 'WORK_SKILLS', 'HEALTH_WELLNESS') NOT NULL,
    `description` TEXT NULL,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportFile_category_idx`(`category`),
    INDEX `SupportFile_isActive_idx`(`isActive`),
    INDEX `SupportFile_fileType_idx`(`fileType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SupportContent` ADD CONSTRAINT `SupportContent_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportFile` ADD CONSTRAINT `SupportFile_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
