const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function basicTest() {
  try {
    console.log('Testing basic tour query...');
    
    // Try to query just the basic fields that should exist
    const tours = await prisma.tour.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        days: true,
        price: true,
        type: true
      }
    });
    
    console.log('✅ Basic tours query works!', tours.length, 'tours found');
    
    if (tours.length > 0) {
      console.log('First tour:', tours[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

basicTest();
