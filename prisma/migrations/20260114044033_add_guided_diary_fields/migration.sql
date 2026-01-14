-- AlterTable
ALTER TABLE `Diary` ADD COLUMN `guidedPrompt` TEXT NULL,
    ADD COLUMN `isGuided` BOOLEAN NOT NULL DEFAULT false;
