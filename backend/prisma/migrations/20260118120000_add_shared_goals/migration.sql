-- CreateTable
CREATE TABLE "SharedGoal" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedGoalItem" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneByUserId" TEXT,
    "doneAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedGoalItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedGoal_ownerUserId_idx" ON "SharedGoal"("ownerUserId");

-- CreateIndex
CREATE INDEX "SharedGoal_partnerUserId_idx" ON "SharedGoal"("partnerUserId");

-- CreateIndex
CREATE INDEX "SharedGoal_isArchived_idx" ON "SharedGoal"("isArchived");

-- CreateIndex
CREATE INDEX "SharedGoal_createdAt_idx" ON "SharedGoal"("createdAt");

-- CreateIndex
CREATE INDEX "SharedGoalItem_goalId_idx" ON "SharedGoalItem"("goalId");

-- CreateIndex
CREATE INDEX "SharedGoalItem_goalId_order_idx" ON "SharedGoalItem"("goalId", "order");

-- CreateIndex
CREATE INDEX "SharedGoalItem_isDone_idx" ON "SharedGoalItem"("isDone");

-- AddForeignKey
ALTER TABLE "SharedGoal" ADD CONSTRAINT "SharedGoal_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedGoal" ADD CONSTRAINT "SharedGoal_partnerUserId_fkey" FOREIGN KEY ("partnerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedGoalItem" ADD CONSTRAINT "SharedGoalItem_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SharedGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedGoalItem" ADD CONSTRAINT "SharedGoalItem_doneByUserId_fkey" FOREIGN KEY ("doneByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
