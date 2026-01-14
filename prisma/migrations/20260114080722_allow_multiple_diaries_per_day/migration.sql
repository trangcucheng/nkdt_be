-- DropIndex: Remove unique constraint to allow multiple diaries per day
DROP INDEX `Diary_userId_date_key` ON `Diary`;

-- CreateIndex: Add regular index for better query performance
CREATE INDEX `Diary_userId_date_idx` ON `Diary`(`userId`, `date`);
