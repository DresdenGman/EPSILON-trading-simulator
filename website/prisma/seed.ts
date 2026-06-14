import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding EPSILON database...");

  // Demo user
  const demoPassword = await bcrypt.hash("demo123", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@epsilon.com" },
    update: {},
    create: {
      email: "demo@epsilon.com",
      name: "Demo Trader",
      initialCapital: 100000.0,
      cash: 100000.0,
    },
  });
  console.log(`  ✓ Demo user: ${demo.email}`);

  // Seed stocks
  const stocks = [
    { code: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
    { code: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ" },
    { code: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
    { code: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
    { code: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
    { code: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ" },
    { code: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
    { code: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
    { code: "V", name: "Visa Inc.", exchange: "NYSE" },
    { code: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
  ];

  for (const stock of stocks) {
    await prisma.stock.upsert({
      where: {
        userId_code: {
          userId: demo.id,
          code: stock.code,
        },
      },
      update: {},
      create: {
        userId: demo.id,
        ...stock,
      },
    });
  }
  console.log(`  ✓ ${stocks.length} stocks seeded`);

  // Seed sample trades
  const appleStock = await prisma.stock.findFirst({
    where: { userId: demo.id, code: "AAPL" },
  });
  const teslaStock = await prisma.stock.findFirst({
    where: { userId: demo.id, code: "TSLA" },
  });

  if (appleStock) {
    await prisma.trade.createMany({
      data: [
        {
          userId: demo.id,
          stockId: appleStock.id,
          tradeDate: new Date("2026-06-01"),
          tradeType: "buy",
          shares: 50,
          price: 185.5,
          totalAmount: 9275.0,
          fee: 9.28,
        },
        {
          userId: demo.id,
          stockId: appleStock.id,
          tradeDate: new Date("2026-06-10"),
          tradeType: "sell",
          shares: 20,
          price: 192.3,
          totalAmount: 3846.0,
          fee: 3.85,
        },
      ],
      skipDuplicates: true,
    });
    console.log("  ✓ Sample AAPL trades seeded");
  }

  if (teslaStock) {
    await prisma.trade.createMany({
      data: [
        {
          userId: demo.id,
          stockId: teslaStock.id,
          tradeDate: new Date("2026-06-05"),
          tradeType: "buy",
          shares: 30,
          price: 245.0,
          totalAmount: 7350.0,
          fee: 7.35,
        },
      ],
      skipDuplicates: true,
    });
    console.log("  ✓ Sample TSLA trades seeded");
  }

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
