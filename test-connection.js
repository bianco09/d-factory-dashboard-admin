const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Check what tables exist
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('Tables in database:', result);
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
