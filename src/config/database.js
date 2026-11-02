import "server-only";

// Read configuration only when persistence is needed; this opens no connection.
export function getDatabaseConfig() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Set DATABASE_URL in .env before using the database.");
  }

  return { connectionString };
}
