import { env } from "./config/env";
import { app } from "./app";
import { prisma } from "./config/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`MedRecords API running on port ${env.PORT}`);
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
