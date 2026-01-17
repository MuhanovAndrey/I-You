-- Add Telegram verification deep-link fields
ALTER TABLE "User" ADD COLUMN "telegramVerifyCode" TEXT;
ALTER TABLE "User" ADD COLUMN "telegramVerifyExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramVerifyCode_key" ON "User"("telegramVerifyCode");
