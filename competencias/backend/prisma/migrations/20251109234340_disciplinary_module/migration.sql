-- CreateTable
CREATE TABLE "DisciplinaryCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reasonSummary" TEXT NOT NULL,
    "details" TEXT,
    "openedByUserId" TEXT NOT NULL,
    "deadlines" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DisciplinaryCase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DisciplinaryCase_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "legalBasis" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Charge_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentAt" DATETIME,
    "acknowledgedAt" DATETIME,
    "toEmail" TEXT,
    "deliveryProofUrl" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DefenseSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "submittedByEmployeeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachmentsCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DefenseSubmission_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hearing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "place" TEXT,
    "panel" TEXT,
    "heldAt" DATETIME,
    "minutesUrl" TEXT,
    "resultSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hearing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sanction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "days" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "decisionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decisionByUserId" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "pdfUrl" TEXT,
    CONSTRAINT "Sanction_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Termination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "causeCode" TEXT NOT NULL,
    "causeText" TEXT NOT NULL,
    "effectiveDate" DATETIME NOT NULL,
    "decisionByUserId" TEXT NOT NULL,
    "settlementReference" TEXT,
    "letterUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Termination_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
