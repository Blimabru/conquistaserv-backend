# ConquistaServ — Back-End

API REST do sistema **ConquistaServ**, desenvolvida com [NestJS](https://nestjs.com/) e [Prisma ORM](https://www.prisma.io/), utilizando PostgreSQL como banco de dados relacional.

---

## Requisitos de Ambiente

> **Atenção:** O não cumprimento das versões especificadas abaixo pode resultar em falhas de instalação, erros de build ou comportamento inesperado em produção.

| Dependência | Versão Requerida | Observação |
|---|---|---|
| **Node.js** | `^22` (LTS atual) | Versões 18 e 20 estão depreciadas nos runners do GitHub Actions a partir de setembro de 2025 |
| **npm** | `>= 8` | Utilize `npm install` — evite `npm ci` caso o `package-lock.json` não esteja atualizado |
| **TypeScript** | `^5.9.3` | Gerenciado via `devDependencies`; não instalar globalmente |
| **Prisma CLI** | `^7.1.0` | Utilizar via `npx prisma`; não instalar globalmente |
| **PostgreSQL** | `^14` ou superior | Necessário para execução local e em produção |

### Justificativa da versão do Node.js

O GitHub Actions deprecou o Node.js 20 nos runners hospedados a partir de **19 de setembro de 2025**, forçando a execução em Node.js 24. Para garantir compatibilidade entre o ambiente local de desenvolvimento e o pipeline de CI/CD, adotou-se o **Node.js 22 LTS** como versão padrão do projeto.

Referência: [GitHub Blog — Deprecation of Node 20 on GitHub-hosted runners](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-hosted-runners/)

---

## Instalação das Dependências

```bash
npm install
```

Após a instalação, é necessário gerar os tipos do Prisma Client:

```bash
npx prisma generate
```

---

## Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com os valores correspondentes ao ambiente de execução desejado, incluindo a `DATABASE_URL` de conexão com o PostgreSQL.

---

## Banco de Dados

### Aplicar migrations

```bash
npx prisma migrate dev
```

### Executar seed (dados iniciais)

```bash
npm run seed
```

### Visualizar banco via Prisma Studio

```bash
npx prisma studio
```

---

## Execução da Aplicação

```bash
# Modo de desenvolvimento (com hot-reload)
npm run dev

# Modo de produção
npm run start:prod
```

---

## Build para Produção

```bash
npm run build
```

O artefato compilado será gerado no diretório `dist/`.

---

## Testes

```bash
# Testes unitários
npm run test

# Testes end-to-end
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

---

## Lint e Formatação

```bash
# Verificação de lint
npm run lint

# Correção automática
npm run lint:fix
```

---

## Pipeline de CI/CD

O pipeline é gerenciado pelo **GitHub Actions** e executa automaticamente a cada push na branch `main`.

### Fluxo de execução

1. **Checkout** do repositório
2. **Configuração do Node.js 22** via `actions/setup-node@v4`
3. **Instalação das dependências** com `npm install`
4. **Geração dos tipos do Prisma Client** com `npx prisma generate`
5. **Build da aplicação** com `npm run build`
6. **Login no GitHub Container Registry (GHCR)**
7. **Build e push da imagem Docker** para `ghcr.io` (plataforma `linux/arm64`)
8. **Deploy na VM Oracle** via SSH

### Secrets necessários no repositório GitHub

| Secret | Descrição |
|---|---|
| `ORACLE_HOST` | Endereço IP ou hostname da VM Oracle |
| `ORACLE_USERNAME` | Usuário SSH da VM Oracle |
| `ORACLE_SSH_KEY` | Chave privada SSH (formato PEM) |

> O secret `GITHUB_TOKEN` é provido automaticamente pelo GitHub Actions e não requer configuração manual.

### Observação sobre o aviso de Node.js depreciado

Ao executar o pipeline, pode ser exibido o seguinte aviso:

```
Node.js 20 is deprecated. The following actions target Node.js 20 but are
being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4.
```

Este aviso refere-se ao **runtime interno** das actions do GitHub, não à versão do Node.js utilizada pelo projeto. Trata-se de uma notificação da própria plataforma GitHub e **não impacta o funcionamento do pipeline**. O aviso cessará quando o GitHub atualizar internamente as actions para Node.js 24.

---

## Documentação da API

A documentação Swagger da API está disponível em tempo de execução no seguinte endereço:

```
http://localhost:<PORT>/api
```

A porta padrão é definida pela variável de ambiente `PORT` no arquivo `.env`.

---

## Licença

Este projeto é de uso interno e não possui licença de distribuição pública.