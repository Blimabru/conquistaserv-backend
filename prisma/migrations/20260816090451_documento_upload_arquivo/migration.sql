-- AlterTable
ALTER TABLE "documentos" DROP COLUMN "fileId",
DROP COLUMN "previewUrl",
ADD COLUMN     "tamanho" INTEGER,
ADD COLUMN     "tipo" TEXT;

