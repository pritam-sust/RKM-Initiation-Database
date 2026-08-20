import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const seedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!seedPassword) {
    throw new Error(
      'ADMIN_SEED_PASSWORD environment variable is not set.\n' +
      'Set it in your .env file before running db:seed.\n' +
      'Example: ADMIN_SEED_PASSWORD="your_strong_password_here"'
    );
  }

  // Create default admin user if not exists
  const adminUsername = 'admin';
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(seedPassword, 10);
    await prisma.adminUser.create({
      data: {
        username: adminUsername,
        password_hash: passwordHash,
      },
    });
    console.log(`Default admin user created with username: "${adminUsername}".`);
  } else {
    console.log('Admin user already exists.');
  }

  // Sample records from user specification
  const samplePersons = [
    {
      unique_id: 'সিএ১২৩৪৫৬',
      name: 'শ্রীপ্রদীপ দে',
      address: 'প্র/ সুবিনয় রায়\nজনতা ব্যাংক\nশেখঘাট শাখা\nসিলেট।',
      diksha_date: '১২-০৫-২০২০',
    },
    {
      unique_id: 'সিএ১২৩৫',
      name: 'শ্রীমতী শিখা দেব',
      address: 'প্র/ সুবিনয় রায়\nজনতা ব্যাংক\nশেখঘাট শাখা\nসিলেট।',
      diksha_date: '১৫-০৮-২০২১',
    },
    {
      unique_id: 'DA6140',
      name: 'Sri Dhiman Rjn Bhowmik',
      address: 'Upatyaka - 13\nHachhannagar\nP.O. & Dist. Sunamganj.',
      diksha_date: '2019-11-04',
    },
    {
      unique_id: 'DA6141',
      name: 'Sm Archana Talukdar',
      address: 'Upatyaka - 13\nHachhannagar\nP.O. & Dist. Sunamganj.',
      diksha_date: '2022-02-18',
    },
  ];

  for (const p of samplePersons) {
    await prisma.person.upsert({
      where: { unique_id: p.unique_id },
      update: {
        name: p.name,
        address: p.address,
        diksha_date: p.diksha_date,
      },
      create: {
        unique_id: p.unique_id,
        name: p.name,
        address: p.address,
        diksha_date: p.diksha_date,
      },
    });
  }

  console.log(`Successfully seeded ${samplePersons.length} sample records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
