-- DropIndex
DROP INDEX `User_refreshToken_key` ON `User`;

-- AlterTable
ALTER TABLE `User` MODIFY `refreshToken` TEXT NULL;
