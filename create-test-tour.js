const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestTour() {
  try {
    console.log('Creating a test tour...');
    
    const tour = await prisma.tour.create({
      data: {
        title: "Test Tour",
        description: "A test tour",
        location: "Test Location",
        days: 1,
        price: 100.0,
        type: "single",
        category: "adventure",
        included: ["Test inclusion"],
        excluded: ["Test exclusion"]
      }
    });
    
    console.log('✅ Test tour created:', tour);
    
    // Now test fetching tours
    const tours = await prisma.tour.findMany();
    console.log('✅ Tours fetched:', tours.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTour();
