#!/bin/sh
# Trava a execução do script caso algum comando falhe
set -e

# ==============================================================================
# PASSO 1: ATUALIZAÇÃO DO BANCO DE DADOS
# ==============================================================================
# Quando o container ligar, a primeira coisa que ele faz é rodar as migrações.
# Isso garante que a estrutura de tabelas do PostgreSQL esteja sempre atualizada
# de acordo com o código mais recente, sem precisar de intervenção manual.
echo "Rodando migrações do banco de dados..."
npx prisma migrate deploy

# ==============================================================================
# PASSO 2: INICIALIZAÇÃO DA API
# ==============================================================================
# Substitui o processo atual (shell) pelo processo do PM2.
# O PM2 vai ler o arquivo 'ecosystem.config.js' e iniciar a aplicação NestJS.
# Ele também se encarrega de reiniciar a API automaticamente caso ela sofra algum crash.
echo "Iniciando a aplicação com PM2..."
exec pm2-runtime ecosystem.config.js
