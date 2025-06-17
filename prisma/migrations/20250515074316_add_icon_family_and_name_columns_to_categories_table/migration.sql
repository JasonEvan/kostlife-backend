/*
  Warnings:

  - Added the required column `icon_family` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon_name` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "icon_family" VARCHAR(100) NOT NULL,
ADD COLUMN     "icon_name" VARCHAR(100) NOT NULL;
