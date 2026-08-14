/*
  Warnings:

  - Changed the type of `nivel` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `situacao` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "nivel",
ADD COLUMN     "nivel" TEXT NOT NULL,
DROP COLUMN "situacao",
ADD COLUMN     "situacao" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Nivel";

-- DropEnum
DROP TYPE "Situacao";
