/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the new columns with temporary defaults
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'temp_password_change_me';
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing users to have a proper hashed password (this is a temporary password)
-- Users will need to reset their passwords or you can update them manually
UPDATE "User" SET 
  "password" = '$2b$12$LQv3c1yqBwlVHpFP6oFwq.T6HZWOQxJvd8TdLYo2XB5sAo8fIkJG6', -- bcrypt hash of 'temporarypassword123'
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "password" = 'temp_password_change_me';

-- Remove the default value from password column after updating existing records
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
