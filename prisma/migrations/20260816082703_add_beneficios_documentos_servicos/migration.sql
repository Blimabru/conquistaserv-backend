-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "acessoRapido" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "icone" TEXT DEFAULT 'apps',
ADD COLUMN     "labelAcao" TEXT DEFAULT 'Acessar',
ADD COLUMN     "urlAcao" TEXT;

-- CreateTable
CREATE TABLE "beneficios" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoLonga" TEXT,
    "icone" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "badge" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "procedimentos" TEXT[],
    "elegibilidade" TEXT[],
    "locais" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficio_downloads" (
    "id" TEXT NOT NULL,
    "beneficioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "beneficio_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "versao" TEXT NOT NULL DEFAULT 'v1.0',
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "corTag" TEXT,
    "fileId" TEXT,
    "url" TEXT NOT NULL,
    "previewUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "beneficio_downloads_beneficioId_idx" ON "beneficio_downloads"("beneficioId");

-- AddForeignKey
ALTER TABLE "beneficio_downloads" ADD CONSTRAINT "beneficio_downloads_beneficioId_fkey" FOREIGN KEY ("beneficioId") REFERENCES "beneficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

