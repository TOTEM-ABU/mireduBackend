-- CreateTable
CREATE TABLE "STUDENT" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "parentsPhoneNumber" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpires" DATETIME,
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TEACHER" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TEACHER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpires" DATETIME,
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ADMIN" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpires" DATETIME,
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SESSION" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipAddress" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "studentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SESSION_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "STUDENT" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GROUP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "students_count" INTEGER NOT NULL DEFAULT 0,
    "teacherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GROUP_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TEACHER" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ATTENDANCE" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ATTENDANCE_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GROUP" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ATTENDANCE_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "STUDENT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PAYMENT" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentType" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PAYMENT_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "STUDENT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GROUPToSTUDENT" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GROUPToSTUDENT_A_fkey" FOREIGN KEY ("A") REFERENCES "GROUP" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GROUPToSTUDENT_B_fkey" FOREIGN KEY ("B") REFERENCES "STUDENT" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "STUDENT_email_key" ON "STUDENT"("email");

-- CreateIndex
CREATE UNIQUE INDEX "STUDENT_phoneNumber_key" ON "STUDENT"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "STUDENT_parentsPhoneNumber_key" ON "STUDENT"("parentsPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TEACHER_email_key" ON "TEACHER"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TEACHER_phoneNumber_key" ON "TEACHER"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ADMIN_email_key" ON "ADMIN"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GROUP_name_key" ON "GROUP"("name");

-- CreateIndex
CREATE INDEX "ATTENDANCE_date_groupId_studentId_idx" ON "ATTENDANCE"("date", "groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "_GROUPToSTUDENT_AB_unique" ON "_GROUPToSTUDENT"("A", "B");

-- CreateIndex
CREATE INDEX "_GROUPToSTUDENT_B_index" ON "_GROUPToSTUDENT"("B");
