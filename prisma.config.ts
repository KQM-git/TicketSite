import fs from "node:fs"
import path from "node:path"
import { defineConfig } from "prisma/config"

// Prisma 7 no longer loads .env by itself, and the datasource url has moved out
// of schema.prisma into this file. Next loads .env on its own for the app.
const envFile = path.join(__dirname, ".env")
if (fs.existsSync(envFile))
  process.loadEnvFile(envFile)

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env["DATABASE_URL"],
  },
})
