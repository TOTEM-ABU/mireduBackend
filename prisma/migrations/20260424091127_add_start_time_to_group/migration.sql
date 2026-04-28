/*
  Warnings:

  - You are about to drop the column `endTime` on the `GROUP` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GROUP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courseType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "days" TEXT DEFAULT '',
    "startTime" TEXT DEFAULT '',
    "students_count" INTEGER NOT NULL DEFAULT 0,
    "teacherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GROUP_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TEACHER" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GROUP" ("courseType", "createdAt", "days", "description", "id", "name", "price", "startTime", "students_count", "teacherId", "updatedAt") SELECT "courseType", "createdAt", "days", "description", "id", "name", "price", "startTime", "students_count", "teacherId", "updatedAt" FROM "GROUP";
DROP TABLE "GROUP";
ALTER TABLE "new_GROUP" RENAME TO "GROUP";
CREATE UNIQUE INDEX "GROUP_name_key" ON "GROUP"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
