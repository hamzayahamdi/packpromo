-- Add slug column if it doesn't exist with a default value
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 
                   FROM information_schema.columns 
                   WHERE table_name='Product' 
                   AND column_name='slug') THEN
        ALTER TABLE "Product" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
        ALTER TABLE "Product" ADD CONSTRAINT "Product_slug_key" UNIQUE("slug");
    END IF;
END $$; 