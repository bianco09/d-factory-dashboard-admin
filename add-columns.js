const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to Tour table...');
    
    // Add category column
    try {
      await prisma.$executeRaw`ALTER TABLE "Tour" ADD COLUMN "category" TEXT DEFAULT 'adventure'`;
      console.log('✅ Added category column');
    } catch (e) {
      console.log('ℹ️  Category column might already exist:', e.message);
    }
    
    // Add included column
    try {
      await prisma.$executeRaw`ALTER TABLE "Tour" ADD COLUMN "included" TEXT[] DEFAULT '{}'`;
      console.log('✅ Added included column');
    } catch (e) {
      console.log('ℹ️  Included column might already exist:', e.message);
    }
    
    // Add excluded column
    try {
      await prisma.$executeRaw`ALTER TABLE "Tour" ADD COLUMN "excluded" TEXT[] DEFAULT '{}'`;
      console.log('✅ Added excluded column');
    } catch (e) {
      console.log('ℹ️  Excluded column might already exist:', e.message);
    }
    
    // Add createdAt column
    try {
      await prisma.$executeRaw`ALTER TABLE "Tour" ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`;
      console.log('✅ Added createdAt column');
    } catch (e) {
      console.log('ℹ️  CreatedAt column might already exist:', e.message);
    }
    
    // Add updatedAt column
    try {
      await prisma.$executeRaw`ALTER TABLE "Tour" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`;
      console.log('✅ Added updatedAt column');
    } catch (e) {
      console.log('ℹ️  UpdatedAt column might already exist:', e.message);
    }
    
    console.log('🎉 Column additions completed!');
    
    // Test the new columns
    const tours = await prisma.tour.findMany();
    console.log('✅ Tours query works with new columns!', tours.length, 'tours found');
    
  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
