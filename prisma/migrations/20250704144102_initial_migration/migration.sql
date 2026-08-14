-- CreateEnum
CREATE TYPE "Situacao" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('ADMIN', 'USUARIO');

-- CreateTable
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nivel" "Nivel" NOT NULL,
    "situacao" "Situacao" NOT NULL,
    "login" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "ipAddress" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "latency" INTEGER NOT NULL,
    "body" JSONB,
    "serviceName" TEXT,
    "actionName" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_login_key" ON "usuarios"("login");

-- CreateIndex
CREATE INDEX "RequestLog_userId_idx" ON "RequestLog"("userId");

-- CreateIndex
CREATE INDEX "RequestLog_timestamp_idx" ON "RequestLog"("timestamp");

-- CreateIndex
CREATE INDEX "RequestLog_path_idx" ON "RequestLog"("path");

-- AddForeignKey
ALTER TABLE "RequestLog" ADD CONSTRAINT "RequestLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
