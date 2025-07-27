import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
  __prismaListenersInstalled?: boolean;
};

const globalWithPrisma = globalThis as GlobalWithPrisma;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  });
}

export const prisma =
  globalWithPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalWithPrisma.prisma = prisma;
}

async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (err) {
    console.error('❌ Disconnect error:', err);
  }
}

if (!globalWithPrisma.__prismaListenersInstalled) {
  process.on('beforeExit', disconnectDatabase);
  process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
  globalWithPrisma.__prismaListenersInstalled = true;
}

export default prisma;