const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSchema() {
  try {
    console.log('Testing database connection and schema...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test Tour model
    const tours = await prisma.tour.findMany({
      take: 1,
      include: {
        tourPlans: true,
        _count: {
          select: { bookings: true }
        }
      }
    });
    console.log('✅ Tour model with tourPlans relation works');
    console.log('Tours found:', tours.length);
    
    // Test TourPlan model
    const tourPlans = await prisma.tourPlan.findMany({ take: 1 });
    console.log('✅ TourPlan model works');
    console.log('Tour plans found:', tourPlans.length);
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSchema();
