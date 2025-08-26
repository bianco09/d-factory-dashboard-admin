-- Add missing columns to Tour table
ALTER TABLE "Tour" 
ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'adventure',
ADD COLUMN IF NOT EXISTS "included" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "excluded" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create TourPlan table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TourPlan" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "included" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourPlan_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for tourId and day
ALTER TABLE "TourPlan" 
ADD CONSTRAINT "TourPlan_tourId_day_key" UNIQUE ("tourId", "day");

-- Add foreign key constraint
ALTER TABLE "TourPlan" 
ADD CONSTRAINT "TourPlan_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
