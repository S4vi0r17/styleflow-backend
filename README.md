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

# 3. Crear el bucket de fotos en MinIO (solo la primera vez)
#    El código no lo crea solo; sin él, /garments/upload falla con NoSuchBucket.
docker run --rm --network backend_default \
  -e "MC_HOST_m=http://styleflow:styleflow123@backend-minio-1:9000" \
  minio/mc mb --ignore-existing m/styleflow-garments

# 4. Configurar variables de entorno
cp .env.example .env        # edita JWT_SECRET y GEMINI_API_KEY

# 5. Crear las tablas en la base de datos
bun run db:push             # aplica el schema directo (desarrollo)

# 6. Arrancar en modo desarrollo (recarga en caliente)
bun run dev
```

La API queda en `http://localhost:3000`.

> **Nota:** el puerto de Postgres es `5435` en el host (mapeado al 5432 del contenedor)
> para no chocar con otros Postgres locales. La `DATABASE_URL` ya apunta ahí.
> El bucket de MinIO también puede crearse desde la consola web en `http://localhost:9001`
> (usuario/clave `styleflow` / `styleflow123`).

## Scripts

| Script                | Qué hace                                  |
| --------------------- | ----------------------------------------- |
| `bun run dev`         | Servidor con recarga en caliente          |
| `bun run start`       | Servidor (producción)                     |
| `bun run db:generate` | Genera migración desde `src/db/schema.ts` |
| `bun run db:migrate`  | Aplica migraciones                        |
| `bun run db:studio`   | Explorador visual de la BD                |
