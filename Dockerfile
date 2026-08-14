# ESTÁGIO 1: Build Nativo (Bypass no QEMU)
FROM --platform=linux/amd64 node:20 AS build-stage
WORKDIR /app
COPY . .
RUN npm i
RUN npx prisma generate
RUN npm run build

# ESTÁGIO 2: Imagem ARM64 Final
FROM node:20
WORKDIR /app
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/prisma ./prisma
COPY --from=build-stage /app/entrypoint.sh ./

RUN npm i -g pm2 @nestjs/cli
RUN chmod +x entrypoint.sh
EXPOSE 3006
CMD ["./entrypoint.sh"]
