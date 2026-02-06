-- CreateTable
CREATE TABLE "SubjectTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeLevelId" TEXT,
    "classId" TEXT,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "parentTopicId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubjectTopic_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubjectTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubjectTopic_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SubjectTopic_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubjectTopic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "SubjectTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Textbook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "edition" TEXT,
    "isbn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Textbook_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Textbook_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassTextbook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "textbookId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassTextbook_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassTextbook_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassTextbook_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Textbook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "objectives" TEXT,
    "content" TEXT,
    "resources" TEXT,
    "scheduledFor" DATETIME,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LessonPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonPlan_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonPlan_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonPlan_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SubjectTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionBankItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeLevelId" TEXT,
    "topicId" TEXT,
    "createdByTeacherId" TEXT,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER,
    "prompt" TEXT NOT NULL,
    "choices" JSONB,
    "answerKey" JSONB,
    "explanation" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionBankItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionBankItem_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionBankItem_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuestionBankItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SubjectTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuestionBankItem_createdByTeacherId_fkey" FOREIGN KEY ("createdByTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "pointsOverride" REAL,
    CONSTRAINT "AssessmentQuestion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssessmentQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionBankItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomeworkAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "createdByTeacherId" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" DATETIME,
    "maxScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HomeworkAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkAssignment_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkAssignment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SubjectTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HomeworkAssignment_createdByTeacherId_fkey" FOREIGN KEY ("createdByTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomeworkSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "attachments" JSONB,
    "score" REAL,
    "feedback" TEXT,
    "gradedAt" DATETIME,
    "gradedByTeacherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HomeworkSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkSubmission_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "HomeworkAssignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkSubmission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkSubmission_gradedByTeacherId_fkey" FOREIGN KEY ("gradedByTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassSubjectTeacherAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ASSISTANT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassSubjectTeacherAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassSubjectTeacherAssignment_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassSubjectTeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "termId" TEXT,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "maxScore" REAL NOT NULL,
    "date" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assessment_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assessment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Assessment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SubjectTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Assessment" ("classSubjectId", "createdAt", "date", "id", "maxScore", "tenantId", "termId", "title", "updatedAt") SELECT "classSubjectId", "createdAt", "date", "id", "maxScore", "tenantId", "termId", "title", "updatedAt" FROM "Assessment";
DROP TABLE "Assessment";
ALTER TABLE "new_Assessment" RENAME TO "Assessment";
CREATE INDEX "Assessment_tenantId_idx" ON "Assessment"("tenantId");
CREATE INDEX "Assessment_tenantId_classSubjectId_idx" ON "Assessment"("tenantId", "classSubjectId");
CREATE INDEX "Assessment_tenantId_topicId_idx" ON "Assessment"("tenantId", "topicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SubjectTopic_tenantId_idx" ON "SubjectTopic"("tenantId");

-- CreateIndex
CREATE INDEX "SubjectTopic_tenantId_subjectId_idx" ON "SubjectTopic"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "SubjectTopic_tenantId_gradeLevelId_idx" ON "SubjectTopic"("tenantId", "gradeLevelId");

-- CreateIndex
CREATE INDEX "SubjectTopic_tenantId_classId_idx" ON "SubjectTopic"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "Textbook_tenantId_idx" ON "Textbook"("tenantId");

-- CreateIndex
CREATE INDEX "Textbook_tenantId_subjectId_idx" ON "Textbook"("tenantId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Textbook_tenantId_title_author_edition_key" ON "Textbook"("tenantId", "title", "author", "edition");

-- CreateIndex
CREATE UNIQUE INDEX "Textbook_tenantId_isbn_key" ON "Textbook"("tenantId", "isbn");

-- CreateIndex
CREATE INDEX "ClassTextbook_tenantId_idx" ON "ClassTextbook"("tenantId");

-- CreateIndex
CREATE INDEX "ClassTextbook_tenantId_classId_idx" ON "ClassTextbook"("tenantId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTextbook_tenantId_classId_textbookId_key" ON "ClassTextbook"("tenantId", "classId", "textbookId");

-- CreateIndex
CREATE INDEX "LessonPlan_tenantId_idx" ON "LessonPlan"("tenantId");

-- CreateIndex
CREATE INDEX "LessonPlan_tenantId_classSubjectId_idx" ON "LessonPlan"("tenantId", "classSubjectId");

-- CreateIndex
CREATE INDEX "LessonPlan_tenantId_teacherId_idx" ON "LessonPlan"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "LessonPlan_tenantId_topicId_idx" ON "LessonPlan"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "QuestionBankItem_tenantId_idx" ON "QuestionBankItem"("tenantId");

-- CreateIndex
CREATE INDEX "QuestionBankItem_tenantId_subjectId_idx" ON "QuestionBankItem"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "QuestionBankItem_tenantId_gradeLevelId_idx" ON "QuestionBankItem"("tenantId", "gradeLevelId");

-- CreateIndex
CREATE INDEX "QuestionBankItem_tenantId_topicId_idx" ON "QuestionBankItem"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_tenantId_idx" ON "AssessmentQuestion"("tenantId");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_tenantId_assessmentId_idx" ON "AssessmentQuestion"("tenantId", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_tenantId_assessmentId_questionId_key" ON "AssessmentQuestion"("tenantId", "assessmentId", "questionId");

-- CreateIndex
CREATE INDEX "HomeworkAssignment_tenantId_idx" ON "HomeworkAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "HomeworkAssignment_tenantId_classSubjectId_idx" ON "HomeworkAssignment"("tenantId", "classSubjectId");

-- CreateIndex
CREATE INDEX "HomeworkAssignment_tenantId_topicId_idx" ON "HomeworkAssignment"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "HomeworkAssignment_tenantId_status_idx" ON "HomeworkAssignment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "HomeworkAssignment_tenantId_dueAt_idx" ON "HomeworkAssignment"("tenantId", "dueAt");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_idx" ON "HomeworkSubmission"("tenantId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_homeworkId_idx" ON "HomeworkSubmission"("tenantId", "homeworkId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_studentId_idx" ON "HomeworkSubmission"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_enrollmentId_idx" ON "HomeworkSubmission"("tenantId", "enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_tenantId_homeworkId_enrollmentId_key" ON "HomeworkSubmission"("tenantId", "homeworkId", "enrollmentId");

-- CreateIndex
CREATE INDEX "ClassSubjectTeacherAssignment_tenantId_idx" ON "ClassSubjectTeacherAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "ClassSubjectTeacherAssignment_tenantId_classSubjectId_idx" ON "ClassSubjectTeacherAssignment"("tenantId", "classSubjectId");

-- CreateIndex
CREATE INDEX "ClassSubjectTeacherAssignment_tenantId_teacherId_idx" ON "ClassSubjectTeacherAssignment"("tenantId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubjectTeacherAssignment_tenantId_classSubjectId_teacherId_key" ON "ClassSubjectTeacherAssignment"("tenantId", "classSubjectId", "teacherId");
