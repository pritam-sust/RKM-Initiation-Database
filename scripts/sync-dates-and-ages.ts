import { PrismaClient } from '@prisma/client';
import { normalizeDateToSortable } from '../lib/dateUtils';

const prisma = new PrismaClient();

async function sync() {
  console.log('Syncing existing records: age cleaning and date normalization...');
  const persons = await prisma.person.findMany();
  console.log(`Found ${persons.length} records in database.`);

  let updatedCount = 0;
  for (const p of persons) {
    const cleanAge = p.age ? p.age.replace(/[$৳₹€£¥]/g, '').replace(/\.00$/, '').trim() : null;
    const sortDate = normalizeDateToSortable(p.diksha_date);

    if (cleanAge !== p.age || sortDate !== p.diksha_date_sort) {
      await prisma.person.update({
        where: { id: p.id },
        data: {
          age: cleanAge,
          diksha_date_sort: sortDate,
        },
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} records with cleaned age and normalized sort dates.`);
}

sync()
  .catch((e) => {
    console.error('Error syncing:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
