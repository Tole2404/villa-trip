const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const data = [
    { name: 'fairuz', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'dipi', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'kenanga', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'andin', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'nova', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'Arsya', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'myria', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'ardiansyah', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'sabila', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'torika', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'bayu', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'enjel', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'Zaidan', phone: '-', targetAmount: 300000, dpAmount: 0 },
    { name: 'gerald', phone: '-', targetAmount: 300000, dpAmount: 0 },
  ];

  const names = data.map((d) => d.name);

  const existing = await prisma.member.findMany({
    where: { name: { in: names } },
    select: { name: true },
  });

  const existingNames = new Set(existing.map((e) => e.name));
  const toCreate = data.filter((d) => !existingNames.has(d.name));

  if (toCreate.length === 0) {
    return;
  }

  await prisma.member.createMany({
    data: toCreate.map((d) => ({
      name: d.name,
      phone: d.phone,
      targetAmount: d.targetAmount,
      dpAmount: d.dpAmount,
      dpPaid: false,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
