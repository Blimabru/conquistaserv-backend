FROM node:22
WORKDIR /app

# Copia os arquivos que JÁ FORAM construídos nativamente pelo Github Actions
COPY package*.json ./
COPY entrypoint.sh ./
COPY prisma.config.ts ./
COPY ecosystem.config.js ./
COPY prisma ./prisma
COPY docs ./docs
COPY dist ./dist
COPY node_modules ./node_modules

# Prepara o ambiente de execução final
RUN npm i -g pm2 @nestjs/cli
RUN chmod +x entrypoint.sh

EXPOSE 3006
CMD ["./entrypoint.sh"]
