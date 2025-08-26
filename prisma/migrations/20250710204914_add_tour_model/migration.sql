-- CreateTable
CREATE TABLE "Tour" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "days" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Tour" ("id", "title", "price") VALUES (1, 'Default Tour', 0);

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "price",
DROP COLUMN "serviceId",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tourId" INTEGER NOT NULL DEFAULT 1;