const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aventur-journeys.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@aventur-journeys.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  });

  // Create a test regular user
  const userPassword = await bcrypt.hash('user123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@aventur-journeys.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@aventur-journeys.com',
      password: userPassword,
      role: 'USER',
      isActive: true,
    },
  });

  console.log('✅ Test user created:', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@aventur-journeys.com / admin123');
  console.log('User:  user@aventur-journeys.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
