/*
  Warnings:

  - A unique constraint covering the columns `[name,type,user_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categories_name_type_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_type_user_id_key" ON "categories"("name", "type", "user_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
