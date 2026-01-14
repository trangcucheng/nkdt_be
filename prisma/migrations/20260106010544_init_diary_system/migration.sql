-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastLogin` DATETIME(3) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `blocked` BOOLEAN NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `User_refreshToken_key`(`refreshToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role_` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role__name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Permission_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermission` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RolePermission_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserRole_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Unit_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Blacklist` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiredAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Blacklist_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoginHistory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `device` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SignLog` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `signedAt` DATETIME(3) NOT NULL,
    `isValid` BOOLEAN NOT NULL,
    `signerName` VARCHAR(191) NULL,
    `issuedBy` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Diary` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `emotionStatus` ENUM('VERY_HAPPY', 'HAPPY', 'NORMAL', 'SAD', 'WORRIED', 'STRESSED', 'ANXIOUS', 'ANGRY', 'EXCITED', 'TIRED') NOT NULL,
    `hashtags` JSON NULL,
    `privacyLevel` ENUM('PRIVATE', 'ANONYMOUS_SHARE', 'STATISTICS_ONLY') NOT NULL DEFAULT 'PRIVATE',
    `date` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Diary_date_idx`(`date`),
    INDEX `Diary_emotionStatus_idx`(`emotionStatus`),
    INDEX `Diary_privacyLevel_idx`(`privacyLevel`),
    UNIQUE INDEX `Diary_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiaryReaction` (
    `id` VARCHAR(191) NOT NULL,
    `diaryId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reactionType` ENUM('EMPATHY', 'SUPPORT', 'ENCOURAGE', 'UNDERSTAND') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DiaryReaction_diaryId_userId_key`(`diaryId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `IdeologicalWorkNote` (
    `id` VARCHAR(191) NOT NULL,
    `managerId` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `activities` TEXT NOT NULL,
    `effectEvaluation` TEXT NULL,
    `targetAudience` VARCHAR(191) NULL,
    `period` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IdeologicalWorkNote_managerId_idx`(`managerId`),
    INDEX `IdeologicalWorkNote_unitId_idx`(`unitId`),
    INDEX `IdeologicalWorkNote_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmotionStatistics` (
    `id` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `emotionStatus` ENUM('VERY_HAPPY', 'HAPPY', 'NORMAL', 'SAD', 'WORRIED', 'STRESSED', 'ANXIOUS', 'ANGRY', 'EXCITED', 'TIRED') NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmotionStatistics_date_idx`(`date`),
    INDEX `EmotionStatistics_emotionStatus_idx`(`emotionStatus`),
    UNIQUE INDEX `EmotionStatistics_unitId_date_emotionStatus_key`(`unitId`, `date`, `emotionStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HashtagTrend` (
    `id` VARCHAR(191) NOT NULL,
    `hashtag` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `date` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HashtagTrend_hashtag_idx`(`hashtag`),
    INDEX `HashtagTrend_date_idx`(`date`),
    INDEX `HashtagTrend_count_idx`(`count`),
    UNIQUE INDEX `HashtagTrend_hashtag_unitId_date_key`(`hashtag`, `unitId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmotionAlert` (
    `id` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NULL,
    `alertLevel` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `resolvedBy` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmotionAlert_unitId_idx`(`unitId`),
    INDEX `EmotionAlert_alertLevel_idx`(`alertLevel`),
    INDEX `EmotionAlert_isResolved_idx`(`isResolved`),
    INDEX `EmotionAlert_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role_`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role_`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoginHistory` ADD CONSTRAINT `LoginHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diary` ADD CONSTRAINT `Diary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiaryReaction` ADD CONSTRAINT `DiaryReaction_diaryId_fkey` FOREIGN KEY (`diaryId`) REFERENCES `Diary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiaryReaction` ADD CONSTRAINT `DiaryReaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportContent` ADD CONSTRAINT `SupportContent_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeologicalWorkNote` ADD CONSTRAINT `IdeologicalWorkNote_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeologicalWorkNote` ADD CONSTRAINT `IdeologicalWorkNote_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmotionStatistics` ADD CONSTRAINT `EmotionStatistics_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HashtagTrend` ADD CONSTRAINT `HashtagTrend_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmotionAlert` ADD CONSTRAINT `EmotionAlert_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmotionAlert` ADD CONSTRAINT `EmotionAlert_resolvedBy_fkey` FOREIGN KEY (`resolvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
