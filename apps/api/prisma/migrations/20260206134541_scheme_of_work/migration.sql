-- CreateTable
CREATE TABLE "SchemeOfWork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "termId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdByTeacherId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SchemeOfWork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWork_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWork_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWork_createdByTeacherId_fkey" FOREIGN KEY ("createdByTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWork_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SchemeOfWorkWeek" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SchemeOfWorkWeek_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWorkWeek_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "SchemeOfWork" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SchemeOfWorkItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "weekId" TEXT,
    "topicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "plannedLessons" INTEGER NOT NULL DEFAULT 1,
    "plannedMinutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "completedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SchemeOfWorkItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWorkItem_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "SchemeOfWork" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWorkItem_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "SchemeOfWorkWeek" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SchemeOfWorkItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SubjectTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "topicId" TEXT,
    "schemeItemId" TEXT,
    "lessonPlanId" TEXT,
    "homeworkId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "scheduledAt" DATETIME,
    "taughtAt" DATETIME,
    "durationMin" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LessonSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonSession_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonSession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SubjectTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LessonSession_schemeItemId_fkey" FOREIGN KEY ("schemeItemId") REFERENCES "SchemeOfWorkItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LessonSession_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LessonSession_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "HomeworkAssignment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SchemeOfWork_tenantId_idx" ON "SchemeOfWork"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeOfWork_tenantId_classSubjectId_idx" ON "SchemeOfWork"("tenantId", "classSubjectId");

-- CreateIndex
CREATE INDEX "SchemeOfWork_tenantId_termId_idx" ON "SchemeOfWork"("tenantId", "termId");

-- CreateIndex
CREATE INDEX "SchemeOfWork_tenantId_status_idx" ON "SchemeOfWork"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SchemeOfWorkWeek_tenantId_idx" ON "SchemeOfWorkWeek"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeOfWorkWeek_tenantId_schemeId_idx" ON "SchemeOfWorkWeek"("tenantId", "schemeId");

-- CreateIndex
CREATE INDEX "SchemeOfWorkWeek_tenantId_startDate_idx" ON "SchemeOfWorkWeek"("tenantId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeOfWorkWeek_tenantId_schemeId_weekNumber_key" ON "SchemeOfWorkWeek"("tenantId", "schemeId", "weekNumber");

-- CreateIndex
CREATE INDEX "SchemeOfWorkItem_tenantId_idx" ON "SchemeOfWorkItem"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeOfWorkItem_tenantId_schemeId_idx" ON "SchemeOfWorkItem"("tenantId", "schemeId");

-- CreateIndex
CREATE INDEX "SchemeOfWorkItem_tenantId_weekId_idx" ON "SchemeOfWorkItem"("tenantId", "weekId");

-- CreateIndex
CREATE INDEX "SchemeOfWorkItem_tenantId_topicId_idx" ON "SchemeOfWorkItem"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "SchemeOfWorkItem_tenantId_status_idx" ON "SchemeOfWorkItem"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_idx" ON "LessonSession"("tenantId");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_classSubjectId_idx" ON "LessonSession"("tenantId", "classSubjectId");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_teacherId_idx" ON "LessonSession"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_topicId_idx" ON "LessonSession"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_schemeItemId_idx" ON "LessonSession"("tenantId", "schemeItemId");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_status_idx" ON "LessonSession"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_scheduledAt_idx" ON "LessonSession"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "LessonSession_tenantId_taughtAt_idx" ON "LessonSession"("tenantId", "taughtAt");
