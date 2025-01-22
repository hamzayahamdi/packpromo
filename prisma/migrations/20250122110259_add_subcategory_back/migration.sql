-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "Product_mainCategory_subCategory_idx" ON "Product"("mainCategory", "subCategory");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
