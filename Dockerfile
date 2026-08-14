FROM node:24-alpine

WORKDIR /app

COPY . .

RUN npm i -g pm2

RUN npm i -g @nestjs/cli

RUN npm i

RUN npx prisma generate

RUN npx prisma migrate deploy

RUN npm run build

RUN npm uninstall typescript

EXPOSE 3006

CMD ["pm2-runtime", "ecosystem.config.js"]
