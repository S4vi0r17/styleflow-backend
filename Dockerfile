FROM oven/bun:1 AS base
WORKDIR /app

# Instala dependencias (incluye devDeps para poder correr drizzle-kit migrate)
COPY package.json bun.lock* ./
RUN bun install

# Copia el código
COPY . .

ENV PORT=3000
EXPOSE 3000

# Aplica migraciones y arranca el servidor
CMD ["sh", "-c", "bun run db:migrate && bun run start"]
