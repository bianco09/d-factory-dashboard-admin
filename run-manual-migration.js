const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function runManualMigration() {
  try {
    console.log('Running manual migration...');
    
    // Read the SQL file
    const sql = fs.readFileSync('manual-migration.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await prisma.$executeRawUnsafe(statement.trim());
      }
    }
    
    console.log('✅ Manual migration completed successfully!');
    
    // Test the new schema
    const tours = await prisma.tour.findMany({
      include: {
        tourPlans: true
      }
    });
    console.log('✅ Tours query with tourPlans works!', tours.length);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runManualMigration();
