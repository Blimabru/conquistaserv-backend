-- CreateTable
CREATE TABLE "canais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PUBLICO',
    "oficial" BOOLEAN NOT NULL DEFAULT false,
    "cor" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "canais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canal_membros" (
    "id" TEXT NOT NULL,
    "canalId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "notificacoesAtivas" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canal_membros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicacoes" (
    "id" TEXT NOT NULL,
    "canalId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "autorId" TEXT,
    "dataPublicacao" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prioridade" INTEGER NOT NULL DEFAULT 0,
    "reacoesHabilitadas" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "publicacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicacao_midias" (
    "id" TEXT NOT NULL,
    "publicacaoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "poster" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publicacao_midias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicacao_reacoes" (
    "id" TEXT NOT NULL,
    "publicacaoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publicacao_reacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicacao_leituras" (
    "id" TEXT NOT NULL,
    "publicacaoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "lidoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publicacao_leituras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesquisas" (
    "id" TEXT NOT NULL,
    "publicacaoId" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "escala" INTEGER NOT NULL DEFAULT 5,
    "permiteComentario" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pesquisas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesquisa_respostas" (
    "id" TEXT NOT NULL,
    "pesquisaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesquisa_respostas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canal_membros_usuarioId_idx" ON "canal_membros"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "canal_membros_canalId_usuarioId_key" ON "canal_membros"("canalId", "usuarioId");

-- CreateIndex
CREATE INDEX "publicacoes_canalId_idx" ON "publicacoes"("canalId");

-- CreateIndex
CREATE INDEX "publicacoes_dataPublicacao_idx" ON "publicacoes"("dataPublicacao");

-- CreateIndex
CREATE INDEX "publicacao_midias_publicacaoId_idx" ON "publicacao_midias"("publicacaoId");

-- CreateIndex
CREATE INDEX "publicacao_reacoes_publicacaoId_idx" ON "publicacao_reacoes"("publicacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "publicacao_reacoes_publicacaoId_usuarioId_key" ON "publicacao_reacoes"("publicacaoId", "usuarioId");

-- CreateIndex
CREATE INDEX "publicacao_leituras_usuarioId_idx" ON "publicacao_leituras"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "publicacao_leituras_publicacaoId_usuarioId_key" ON "publicacao_leituras"("publicacaoId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "pesquisas_publicacaoId_key" ON "pesquisas"("publicacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "pesquisa_respostas_pesquisaId_usuarioId_key" ON "pesquisa_respostas"("pesquisaId", "usuarioId");

-- AddForeignKey
ALTER TABLE "canal_membros" ADD CONSTRAINT "canal_membros_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "canais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canal_membros" ADD CONSTRAINT "canal_membros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacoes" ADD CONSTRAINT "publicacoes_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "canais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacoes" ADD CONSTRAINT "publicacoes_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacao_midias" ADD CONSTRAINT "publicacao_midias_publicacaoId_fkey" FOREIGN KEY ("publicacaoId") REFERENCES "publicacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacao_reacoes" ADD CONSTRAINT "publicacao_reacoes_publicacaoId_fkey" FOREIGN KEY ("publicacaoId") REFERENCES "publicacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacao_reacoes" ADD CONSTRAINT "publicacao_reacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacao_leituras" ADD CONSTRAINT "publicacao_leituras_publicacaoId_fkey" FOREIGN KEY ("publicacaoId") REFERENCES "publicacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacao_leituras" ADD CONSTRAINT "publicacao_leituras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisas" ADD CONSTRAINT "pesquisas_publicacaoId_fkey" FOREIGN KEY ("publicacaoId") REFERENCES "publicacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisa_respostas" ADD CONSTRAINT "pesquisa_respostas_pesquisaId_fkey" FOREIGN KEY ("pesquisaId") REFERENCES "pesquisas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisa_respostas" ADD CONSTRAINT "pesquisa_respostas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
