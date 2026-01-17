-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "telegramChatId" TEXT,
    "telegramVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pairedWithId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairingRequest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PairingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoveReason" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoveReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftIdea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatePost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "loveReasonId" TEXT,
    "giftIdeaId" TEXT,
    "statePostId" TEXT,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "loveReasonId" TEXT,
    "giftIdeaId" TEXT,
    "statePostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUsername_key" ON "User"("telegramUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramChatId_key" ON "User"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "User_pairedWithId_key" ON "User"("pairedWithId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_telegramChatId_idx" ON "User"("telegramChatId");

-- CreateIndex
CREATE INDEX "PairingRequest_toUserId_idx" ON "PairingRequest"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PairingRequest_fromUserId_toUserId_key" ON "PairingRequest"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "LoveReason_userId_idx" ON "LoveReason"("userId");

-- CreateIndex
CREATE INDEX "LoveReason_createdAt_idx" ON "LoveReason"("createdAt");

-- CreateIndex
CREATE INDEX "GiftIdea_userId_idx" ON "GiftIdea"("userId");

-- CreateIndex
CREATE INDEX "GiftIdea_createdAt_idx" ON "GiftIdea"("createdAt");

-- CreateIndex
CREATE INDEX "StatePost_userId_idx" ON "StatePost"("userId");

-- CreateIndex
CREATE INDEX "StatePost_createdAt_idx" ON "StatePost"("createdAt");

-- CreateIndex
CREATE INDEX "Reaction_loveReasonId_idx" ON "Reaction"("loveReasonId");

-- CreateIndex
CREATE INDEX "Reaction_giftIdeaId_idx" ON "Reaction"("giftIdeaId");

-- CreateIndex
CREATE INDEX "Reaction_statePostId_idx" ON "Reaction"("statePostId");

-- CreateIndex
CREATE INDEX "Reaction_commentId_idx" ON "Reaction"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_type_loveReasonId_key" ON "Reaction"("userId", "type", "loveReasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_type_giftIdeaId_key" ON "Reaction"("userId", "type", "giftIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_type_statePostId_key" ON "Reaction"("userId", "type", "statePostId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_type_commentId_key" ON "Reaction"("userId", "type", "commentId");

-- CreateIndex
CREATE INDEX "Comment_loveReasonId_idx" ON "Comment"("loveReasonId");

-- CreateIndex
CREATE INDEX "Comment_giftIdeaId_idx" ON "Comment"("giftIdeaId");

-- CreateIndex
CREATE INDEX "Comment_statePostId_idx" ON "Comment"("statePostId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pairedWithId_fkey" FOREIGN KEY ("pairedWithId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairingRequest" ADD CONSTRAINT "PairingRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairingRequest" ADD CONSTRAINT "PairingRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoveReason" ADD CONSTRAINT "LoveReason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftIdea" ADD CONSTRAINT "GiftIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatePost" ADD CONSTRAINT "StatePost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_loveReasonId_fkey" FOREIGN KEY ("loveReasonId") REFERENCES "LoveReason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_giftIdeaId_fkey" FOREIGN KEY ("giftIdeaId") REFERENCES "GiftIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_statePostId_fkey" FOREIGN KEY ("statePostId") REFERENCES "StatePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_loveReasonId_fkey" FOREIGN KEY ("loveReasonId") REFERENCES "LoveReason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_giftIdeaId_fkey" FOREIGN KEY ("giftIdeaId") REFERENCES "GiftIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_statePostId_fkey" FOREIGN KEY ("statePostId") REFERENCES "StatePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
