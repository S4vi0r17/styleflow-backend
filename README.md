# StyleFlow AI — Backend

API del MVP de StyleFlow AI. Stack: **Hono + Bun + PostgreSQL + Drizzle ORM**.

## Requisitos

- [Bun](https://bun.sh) instalado
- Docker (para Postgres y MinIO en local)

## Puesta en marcha (local)

```bash
# 1. Instalar dependencias
bun install

# 2. Levantar Postgres + MinIO
docker compose up -d

# 3. Configurar variables de entorno
cp .env.example .env        # edita JWT_SECRET y, más adelante, GEMINI_API_KEY

# 4. Crear las tablas en la base de datos
bun run db:generate         # genera la migración a partir del schema
bun run db:migrate          # la aplica

# 5. Arrancar en modo desarrollo (recarga en caliente)
bun run dev
```

La API queda en `http://localhost:3000`.

## Scripts

| Script                | Qué hace                                  |
| --------------------- | ----------------------------------------- |
| `bun run dev`         | Servidor con recarga en caliente          |
| `bun run start`       | Servidor (producción)                     |
| `bun run db:generate` | Genera migración desde `src/db/schema.ts` |
| `bun run db:migrate`  | Aplica migraciones                        |
| `bun run db:studio`   | Explorador visual de la BD                |
