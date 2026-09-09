/**
 * Idempotent demo seed. Everything is scoped to a single demo user, so
 * re-running only ever rewrites that user's data.
 *
 *   npm run db:seed
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@fintrack.app";
const DEMO_PASSWORD = "demo12345";

const CATEGORIES: Array<
  Pick<Prisma.CategoryCreateManyInput, "name" | "kind" | "color" | "icon">
> = [
  { name: "Salário", kind: "INCOME", color: "#16a34a", icon: "wallet" },
  { name: "Renda extra", kind: "INCOME", color: "#0d9488", icon: "plus" },
  { name: "Moradia", kind: "EXPENSE", color: "#6366f1", icon: "home" },
  { name: "Alimentação", kind: "EXPENSE", color: "#f97316", icon: "utensils" },
  { name: "Transporte", kind: "EXPENSE", color: "#0ea5e9", icon: "car" },
  { name: "Saúde", kind: "EXPENSE", color: "#ef4444", icon: "heart-pulse" },
  { name: "Lazer", kind: "EXPENSE", color: "#a855f7", icon: "party-popper" },
  { name: "Assinaturas", kind: "EXPENSE", color: "#ec4899", icon: "repeat" },
  {
    name: "Educação",
    kind: "EXPENSE",
    color: "#eab308",
    icon: "graduation-cap",
  },
  { name: "Compras", kind: "EXPENSE", color: "#14b8a6", icon: "shopping-bag" },
  { name: "Outros", kind: "EXPENSE", color: "#64748b", icon: "ellipsis" },
];

const RULES: Array<{
  pattern: string;
  category: string;
  matchType?: Prisma.CategoryRuleCreateManyInput["matchType"];
}> = [
  { pattern: "ifood", category: "Alimentação" },
  { pattern: "supermercado", category: "Alimentação" },
  { pattern: "uber", category: "Transporte" },
  { pattern: "posto", category: "Transporte" },
  {
    pattern: "netflix|spotify|prime",
    category: "Assinaturas",
    matchType: "REGEX",
  },
  { pattern: "farmacia", category: "Saúde" },
  { pattern: "amazon", category: "Compras" },
];

function daysAgoUtc(monthsBack: number, day: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, day, 12),
  );
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, name: "Conta Demo" },
    create: { email: DEMO_EMAIL, name: "Conta Demo", passwordHash },
    select: { id: true },
  });
  const userId = user.id;

  // Clean slate for this user.
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.budget.deleteMany({ where: { userId } });
  await prisma.categoryRule.deleteMany({ where: { userId } });
  await prisma.importBatch.deleteMany({ where: { userId } });
  await prisma.category.deleteMany({ where: { userId } });
  await prisma.financialAccount.deleteMany({ where: { userId } });

  const checking = await prisma.financialAccount.create({
    data: {
      userId,
      name: "Conta corrente",
      type: "CHECKING",
      institution: "Banco Demo",
      initialBalance: 350000,
      color: "#6366f1",
    },
    select: { id: true },
  });
  await prisma.financialAccount.create({
    data: {
      userId,
      name: "Carteira",
      type: "CASH",
      initialBalance: 12000,
      color: "#f97316",
    },
  });
  await prisma.financialAccount.create({
    data: {
      userId,
      name: "Poupança",
      type: "SAVINGS",
      institution: "Banco Demo",
      initialBalance: 1500000,
      color: "#16a34a",
    },
  });

  await prisma.category.createMany({
    data: CATEGORIES.map((c) => ({ ...c, userId })),
  });
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const catId = (name: string) =>
    categories.find((c) => c.name === name)?.id ?? null;

  await prisma.categoryRule.createMany({
    data: RULES.map((r, i) => ({
      userId,
      matchType: r.matchType ?? "CONTAINS",
      pattern: r.pattern,
      categoryId: catId(r.category)!,
      priority: RULES.length - i,
    })),
  });

  const rows: Prisma.TransactionCreateManyInput[] = [];
  const push = (
    date: Date,
    description: string,
    amountCents: number,
    kind: "INCOME" | "EXPENSE",
    category: string | null,
  ) =>
    rows.push({
      userId,
      financialAccountId: checking.id,
      date,
      description,
      amountCents,
      kind,
      categoryId: category ? catId(category) : null,
    });

  for (let mo = 5; mo >= 0; mo--) {
    push(daysAgoUtc(mo, 5), "Salário mensal", 780000, "INCOME", "Salário");
    if (mo % 2 === 0)
      push(
        daysAgoUtc(mo, 20),
        "Projeto freelance",
        120000,
        "INCOME",
        "Renda extra",
      );

    push(daysAgoUtc(mo, 6), "Aluguel", 220000, "EXPENSE", "Moradia");
    push(daysAgoUtc(mo, 7), "Condomínio", 65000, "EXPENSE", "Moradia");
    push(
      daysAgoUtc(mo, 9),
      "Supermercado Barato",
      42000 + mo * 3100,
      "EXPENSE",
      "Alimentação",
    );
    push(
      daysAgoUtc(mo, 12),
      "IFOOD *PEDIDO",
      5900 + mo * 700,
      "EXPENSE",
      "Alimentação",
    );
    push(daysAgoUtc(mo, 13), "IFOOD *PEDIDO", 4200, "EXPENSE", "Alimentação");
    push(daysAgoUtc(mo, 14), "Posto Ipiranga", 24000, "EXPENSE", "Transporte");
    push(
      daysAgoUtc(mo, 16),
      "Uber viagem",
      3200 + mo * 300,
      "EXPENSE",
      "Transporte",
    );
    push(daysAgoUtc(mo, 15), "Netflix", 5590, "EXPENSE", "Assinaturas");
    push(daysAgoUtc(mo, 15), "Spotify", 2190, "EXPENSE", "Assinaturas");
    push(
      daysAgoUtc(mo, 18),
      "Farmacia Popular",
      7800 + mo * 400,
      "EXPENSE",
      "Saúde",
    );
    push(daysAgoUtc(mo, 22), "Cinema", 8000, "EXPENSE", "Lazer");
    push(
      daysAgoUtc(mo, 24),
      "Amazon compra",
      12900 + mo * 1500,
      "EXPENSE",
      "Compras",
    );
    push(daysAgoUtc(mo, 26), "Curso online", 9900, "EXPENSE", "Educação");
  }
  await prisma.transaction.createMany({ data: rows });

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  await prisma.budget.createMany({
    data: [
      {
        userId,
        categoryId: catId("Alimentação")!,
        month: monthStart,
        limitCents: 90000,
      },
      {
        userId,
        categoryId: catId("Transporte")!,
        month: monthStart,
        limitCents: 35000,
      },
      {
        userId,
        categoryId: catId("Lazer")!,
        month: monthStart,
        limitCents: 15000,
      },
      {
        userId,
        categoryId: catId("Assinaturas")!,
        month: monthStart,
        limitCents: 10000,
      },
    ],
  });

  console.log(
    `Seed OK — ${DEMO_EMAIL} / ${DEMO_PASSWORD} · ${rows.length} transações`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
