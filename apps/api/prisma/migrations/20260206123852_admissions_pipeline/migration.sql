-- CreateTable
CREATE TABLE "LeadSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeadSource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "leadSourceId" TEXT,
    "leadSourceDetails" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "studentName" TEXT,
    "studentDob" DATETIME,
    "desiredEducationSystemId" TEXT,
    "desiredGradeLevelId" TEXT,
    "desiredAcademicYear" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "convertedStudentId" TEXT,
    "convertedAt" DATETIME,
    CONSTRAINT "Inquiry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inquiry_leadSourceId_fkey" FOREIGN KEY ("leadSourceId") REFERENCES "LeadSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inquiry_desiredEducationSystemId_fkey" FOREIGN KEY ("desiredEducationSystemId") REFERENCES "EducationSystem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inquiry_desiredGradeLevelId_fkey" FOREIGN KEY ("desiredGradeLevelId") REFERENCES "GradeLevel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inquiry_convertedStudentId_fkey" FOREIGN KEY ("convertedStudentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnrollmentApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "inquiryId" TEXT,
    "studentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "desiredEducationSystemId" TEXT,
    "desiredGradeLevelId" TEXT,
    "desiredAcademicYear" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "convertedEnrollmentId" TEXT,
    "convertedAt" DATETIME,
    CONSTRAINT "EnrollmentApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnrollmentApplication_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EnrollmentApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EnrollmentApplication_desiredEducationSystemId_fkey" FOREIGN KEY ("desiredEducationSystemId") REFERENCES "EducationSystem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EnrollmentApplication_desiredGradeLevelId_fkey" FOREIGN KEY ("desiredGradeLevelId") REFERENCES "GradeLevel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EnrollmentApplication_convertedEnrollmentId_fkey" FOREIGN KEY ("convertedEnrollmentId") REFERENCES "Enrollment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "location" TEXT,
    "notes" TEXT,
    "overallScore" REAL,
    "interviewerUserId" TEXT,
    "interviewerTeacherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EnrollmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interview_interviewerUserId_fkey" FOREIGN KEY ("interviewerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Interview_interviewerTeacherId_fkey" FOREIGN KEY ("interviewerTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewCriterion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewCriterion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewScore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InterviewScore_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InterviewScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "InterviewCriterion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LeadSource_tenantId_idx" ON "LeadSource"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadSource_tenantId_code_key" ON "LeadSource"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "LeadSource_tenantId_name_key" ON "LeadSource"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Inquiry_tenantId_idx" ON "Inquiry"("tenantId");

-- CreateIndex
CREATE INDEX "Inquiry_tenantId_status_idx" ON "Inquiry"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Inquiry_tenantId_leadSourceId_idx" ON "Inquiry"("tenantId", "leadSourceId");

-- CreateIndex
CREATE INDEX "Inquiry_tenantId_createdAt_idx" ON "Inquiry"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentApplication_convertedEnrollmentId_key" ON "EnrollmentApplication"("convertedEnrollmentId");

-- CreateIndex
CREATE INDEX "EnrollmentApplication_tenantId_idx" ON "EnrollmentApplication"("tenantId");

-- CreateIndex
CREATE INDEX "EnrollmentApplication_tenantId_status_idx" ON "EnrollmentApplication"("tenantId", "status");

-- CreateIndex
CREATE INDEX "EnrollmentApplication_tenantId_submittedAt_idx" ON "EnrollmentApplication"("tenantId", "submittedAt");

-- CreateIndex
CREATE INDEX "EnrollmentApplication_tenantId_inquiryId_idx" ON "EnrollmentApplication"("tenantId", "inquiryId");

-- CreateIndex
CREATE INDEX "EnrollmentApplication_tenantId_studentId_idx" ON "EnrollmentApplication"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "EnrollmentApplication_tenantId_convertedEnrollmentId_idx" ON "EnrollmentApplication"("tenantId", "convertedEnrollmentId");

-- CreateIndex
CREATE INDEX "Interview_tenantId_idx" ON "Interview"("tenantId");

-- CreateIndex
CREATE INDEX "Interview_tenantId_applicationId_idx" ON "Interview"("tenantId", "applicationId");

-- CreateIndex
CREATE INDEX "Interview_tenantId_status_idx" ON "Interview"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Interview_tenantId_decision_idx" ON "Interview"("tenantId", "decision");

-- CreateIndex
CREATE INDEX "Interview_tenantId_scheduledAt_idx" ON "Interview"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "InterviewCriterion_tenantId_idx" ON "InterviewCriterion"("tenantId");

-- CreateIndex
CREATE INDEX "InterviewCriterion_tenantId_isActive_idx" ON "InterviewCriterion"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewCriterion_tenantId_name_key" ON "InterviewCriterion"("tenantId", "name");

-- CreateIndex
CREATE INDEX "InterviewScore_tenantId_idx" ON "InterviewScore"("tenantId");

-- CreateIndex
CREATE INDEX "InterviewScore_tenantId_interviewId_idx" ON "InterviewScore"("tenantId", "interviewId");

-- CreateIndex
CREATE INDEX "InterviewScore_tenantId_criterionId_idx" ON "InterviewScore"("tenantId", "criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewScore_tenantId_interviewId_criterionId_key" ON "InterviewScore"("tenantId", "interviewId", "criterionId");
