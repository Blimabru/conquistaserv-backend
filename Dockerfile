# Utiliza a imagem oficial do Node.js versão 24 (baseada na distribuição leve Alpine)
FROM node:24-alpine

# Define o diretório de trabalho padrão dentro do container
WORKDIR /app

# Copia todos os arquivos do projeto local para dentro do diretório /app do container
COPY . .

# Instala o gerenciador de processos PM2 globalmente para manter a aplicação rodando em produção
RUN npm i -g pm2

# Instala a interface de linha de comando do NestJS para permitir o build do projeto
RUN npm i -g @nestjs/cli

# Instala as dependências do projeto definidas no package.json
RUN npm i

# Gera o client do Prisma (necessário para o ORM se comunicar com o banco de dados)
RUN npx prisma generate

# Compila o código TypeScript para JavaScript na pasta 'dist'
RUN npm run build

# Remove o TypeScript para economizar espaço e deixar a imagem mais leve, já que não é mais necessário em produção
RUN npm uninstall typescript

# Dá permissão de execução ao script de inicialização
RUN chmod +x entrypoint.sh

# Informa ao Docker que a aplicação escuta na porta 3006
EXPOSE 3006

# Define o comando que será executado quando o container for iniciado no servidor.
# Usamos o entrypoint.sh para rodar as migrações do banco ANTES de iniciar a aplicação.
CMD ["./entrypoint.sh"]
