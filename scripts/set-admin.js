// Quick script to set a user to ADMIN role
// Usage: node scripts/set-admin.js testuser@gmail.com

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`✅ User "${email}" is already an ADMIN`);
      await prisma.$disconnect();
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`✅ Successfully set user "${email}" to ADMIN role`);
    console.log(`   User ID: ${updatedUser.id}`);
    console.log(`   Name: ${updatedUser.name || 'N/A'}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node scripts/set-admin.js <email>');
  console.log('Example: node scripts/set-admin.js testuser@gmail.com');
  process.exit(1);
}

setAdmin(email);
