import { PrismaClient } from '@prisma/client';

// Helper to extend the globalThis with an optional PrismaClient
type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

// Cast globalThis once
const globalWithPrisma = globalThis as GlobalWithPrisma;

// Factory to create a new PrismaClient
function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// Reuse existing client in dev, or create a new one
export const prisma =
  globalWithPrisma.prisma ?? createPrismaClient();

// In development mode, attach to globalThis so it isn't
// re-instantiated on hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalWithPrisma.prisma = prisma;
}

// Optional: health-check utilities

export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    const userCount = await prisma.user.count();
    console.log(`📊 Database test: ${userCount} users found`);
    return { success: true, userCount };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
}

export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    const [buyCarCount, rentalCarCount, userCount] = await Promise.all([
      prisma.buyCar.count(),
      prisma.rentalCar.count(),
      prisma.user.count(),
    ]);
    const health = {
      connected: true,
      tables: { buyCars: buyCarCount, rentalCars: rentalCarCount, users: userCount },
      timestamp: new Date().toISOString(),
    };
    console.log('🏥 Database health check:', health);
    return health;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Graceful shutdown on process end
process.on('beforeExit', disconnectDatabase);
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

// Default export for convenience
export default prisma;