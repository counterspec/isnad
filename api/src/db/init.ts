import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function init() {
  console.log('Initializing database...');
  
  // Create initial sync state
  await prisma.syncState.upsert({
    where: { id: 'main' },
    create: { id: 'main', lastBlock: 0n },
    update: {},
  });
  
  console.log('Database initialized!');
  await prisma.$disconnect();
}

init().catch(console.error);
