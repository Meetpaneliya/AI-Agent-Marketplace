import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ddpxxlawxlnrtrzqfxkw:Meet%401%232%233%234@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";

// Parse URL into explicit options so pg doesn't override rejectUnauthorized
const url = new URL(connectionString.replace(/^postgres(ql)?:\/\//, "http://"));

declare global {
  // eslint-disable-next-line no-var
  var __pg_pool: Pool | undefined;
}

const pool =
  globalThis.__pg_pool ||
  new Pool({
    host: url.hostname,
    port: parseInt(url.port || "5432", 10),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1) || "postgres",
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pg_pool = pool;
}

export default pool;
