-- CreateTable
CREATE TABLE "Proxy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latency" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Proxy_host_port_key" ON "Proxy"("host", "port");
