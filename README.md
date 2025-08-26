# d-factory-bookings-be

A Node.js/Express backend boilerplate for bookings apps, ready for Vercel deployment and PostgreSQL integration. Includes modular structure, Prisma ORM, and sample endpoints.

## Features
- Express.js server
- PostgreSQL with Prisma ORM
- Modular structure for routes, controllers, and models
- Health check and sample bookings endpoint
- Ready for Vercel deployment

## Getting Started
1. Install dependencies: `npm install`
2. Configure your database in `.env` and `prisma/schema.prisma`
3. Run migrations: `npx prisma migrate dev --name init`
4. Start the server: `node src/index.js`

## Deployment
- Deploy to Vercel using the Vercel dashboard or CLI.

## License
MIT
