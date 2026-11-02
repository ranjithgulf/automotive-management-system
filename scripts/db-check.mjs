import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Read-only diagnostics: never print the connection string or table contents.
if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL in the project root .env file.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 8000,
    max: 1,
  }),
});

try {
  const tables = await prisma.$queryRaw`
    SELECT table_schema, table_name, table_type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `;
  console.log("PostgreSQL connection verified through Prisma Client.");
  if (tables.length) console.table(tables);
  else console.log("Application tables: none. The foundation schema has no models.");
} catch (error) {
  // Error messages from drivers can contain connection details; omit them.
  console.error(`Database check failed (${error.code || "CONNECTION_ERROR"}). Check .env and PostgreSQL access.`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
