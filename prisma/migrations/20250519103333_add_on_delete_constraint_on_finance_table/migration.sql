-- DropForeignKey
ALTER TABLE "finances" DROP CONSTRAINT "finances_category_id_fkey";

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
