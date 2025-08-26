const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Users
  await prisma.user.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' },
    ],
    skipDuplicates: true,
  });

  // Create Tours
  await prisma.tour.createMany({
    data: [
      {
        title: 'City Explorer',
        description: 'Discover the city highlights.',
        location: 'New York',
        days: 2,
        price: 150,
      },
      {
        title: 'Mountain Adventure',
        description: 'Hiking and camping in the mountains.',
        location: 'Colorado',
        days: 3,
        price: 300,
      },
      {
        title: 'Beach Relaxation',
        description: 'Enjoy the sun and sea.',
        location: 'Miami',
        days: 1,
        price: 100,
      },
    ],
    skipDuplicates: true,
  });

  // Fetch users and tours for IDs
  const allUsers = await prisma.user.findMany();
  const allTours = await prisma.tour.findMany();

  // Create Bookings
  for (let i = 0; i < 10; i++) {
    const tour = allTours[Math.floor(Math.random() * allTours.length)];
    const people = Math.floor(Math.random() * 5) + 1;
    await prisma.booking.create({
      data: {
        userId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
        tourId: tour.id,
        date: new Date(Date.now() + Math.floor(Math.random() * 1000000000)),
        people,
        total: tour.price * people,
      },
    });
  }

  console.log('Seed data created!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });