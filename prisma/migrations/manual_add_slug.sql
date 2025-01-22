-- Safe migration that preserves data
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "slug" TEXT;
UPDATE "Product" SET "slug" = '' WHERE "slug" IS NULL;
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "slug" SET DEFAULT '';
ALTER TABLE "Product" ADD CONSTRAINT "Product_slug_key" UNIQUE("slug"); 