FROM node:20
WORKDIR /app

# Copia os arquivos que JÁ FORAM construídos nativamente pelo Github Actions
COPY package*.json ./
COPY entrypoint.sh ./
COPY prisma ./prisma
COPY dist ./dist
COPY node_modules ./node_modules

# Prepara o ambiente de execução final
RUN npm i -g pm2 @nestjs/cli
RUN chmod +x entrypoint.sh

EXPOSE 3006
CMD ["./entrypoint.sh"]
