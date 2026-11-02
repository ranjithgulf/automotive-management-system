import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseConfig } from "@/config/database";

// Lazy initialization keeps the frontend prototype independent of PostgreSQL.
// Reuse the client across Next.js development reloads instead of opening pools.
let productionClient;

export function getPrisma() {
  const cached = process.env.NODE_ENV === "production"
    ? productionClient
    : globalThis.autoflowPrisma;
  if (cached) return cached;

  const adapter = new PrismaPg({
    ...getDatabaseConfig(),
    max: 5,
    connectionTimeoutMillis: 8000,
  });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV === "production") productionClient = client;
  else globalThis.autoflowPrisma = client;
  return client;
}
