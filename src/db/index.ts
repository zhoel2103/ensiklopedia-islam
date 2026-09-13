import * as schema from "./schema"

const globalForDb = globalThis as unknown as {
  db?: any
}

function init() {
  try {
    if (typeof process === 'undefined' || (process as any).release?.name !== 'node') {
      return null;
    }
    const Database = require("better-sqlite3")
    const { drizzle } = require("drizzle-orm/better-sqlite3")
    const { migrate } = require("drizzle-orm/better-sqlite3/migrator")

    const dbPath = process.env.DATABASE_PATH ?? "ensiklopedi.db"
    const sqlite = new Database(dbPath, { fileMustExist: false })
    const drizzleDb = drizzle(sqlite, { schema })
    try {
      migrate(drizzleDb, { migrationsFolder: "./drizzle" })
    } catch {
      // Ignore migration errors on serverless read-only disk
    }
    return drizzleDb
  } catch {
    // Graceful fallback for serverless environments where native sqlite is read-only/unavailable
    return null
  }
}

export const db: any = globalForDb.db ?? init()

if (process.env.NODE_ENV !== "production" && db) globalForDb.db = db
