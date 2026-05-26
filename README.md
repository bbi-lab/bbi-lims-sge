# BBI SGE LIMS

Laboratory Inventory Management System (LIMS) for the BBI SGE lab, built with Nuxt 3 and Drizzle ORM on a PostgreSQL backend.

> **Note:** This is the first-generation LIMS for this stack and is tailored to BBI SGE lab requirements. A newer, more modular version using Nuxt layers and Drizzle v1 is available at [bbi-lab/bbi-lims-nuxt-monorepo](https://github.com/bbi-lab/bbi-lims-nuxt-monorepo).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 3](https://nuxt.com/) (Vue 3) |
| Database ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Database | PostgreSQL |
| UI components | [PrimeVue 4](https://primevue.org/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Auth | [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) + JWT |
| Testing | [Vitest](https://vitest.dev/) + [@nuxt/test-utils](https://nuxt.com/docs/getting-started/testing) |
| Package manager | [pnpm](https://pnpm.io/) |

## Prerequisites

- **Node.js** v18 or later (v20+ recommended)
- **pnpm** v9 or later
- **PostgreSQL** v14 or later

## Getting Started

### 1. Install pnpm

```bash
npm install -g pnpm
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example env file and update the values for your local setup:

```bash
cp .env.example .env
```

See the [Environment Variables](#environment-variables) section below for a description of each variable.

### 4. Set up the database

Create a new PostgreSQL database, then push the schema:

```bash
pnpm drizzle-kit push
```

### 5. Start the development server

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

All variables are prefixed with `NUXT_` so Nuxt's runtime config can pick them up automatically.

| Variable | Description | Default |
|---|---|---|
| `NUXT_DB_HOST` | PostgreSQL host | `localhost` |
| `NUXT_DB_PORT` | PostgreSQL port | `5432` |
| `NUXT_DB_USERNAME` | Database user | `postgres` |
| `NUXT_DB_PASSWORD` | Database password | `postgres` |
| `NUXT_DB_DATABASE_NAME` | Database name | `sge_lims_db` |
| `NUXT_DB_SSL` | Enable SSL for DB connection | `false` |
| `NUXT_DB_SSL_CA` | Inline PEM/base64 CA certificate for SSL (optional) | — |
| `NUXT_DB_SSL_CA_PATH` | Path to a CA certificate file for SSL (optional) | — |
| `NUXT_PUBLIC_API_BASE` | API base path (exposed to client) | `/api` |
| `NUXT_PUBLIC_APP_URL` | Public URL of the app (exposed to client) | `http://localhost:3000` |
| `NUXT_AUTH_JWT_ACCESS_TOKEN_SECRET` | Secret for signing access JWTs — **change in production** | — |
| `NUXT_AUTH_JWT_REFRESH_TOKEN_SECRET` | Secret for signing refresh JWTs — **change in production** | — |
| `NUXT_AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN` | Access token TTL | `5m` |
| `NUXT_AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN` | Refresh token TTL | `10m` |
| `NUXT_SESSION_PASSWORD` | Session encryption password, min 32 characters — **change in production** | — |

> **Security:** Never commit real secrets to version control. In production, use a secrets manager or your hosting platform's environment variable injection.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run the test suite |
| `pnpm drizzle-kit push` | Push schema changes to the database |
| `pnpm drizzle-kit generate` | Generate a new migration file |
| `pnpm drizzle-kit studio` | Open Drizzle Studio (DB GUI) |

## Testing

Tests require a running development server (the test script handles this automatically):

```bash
pnpm test
```

To run the dev server and tests separately (e.g. to watch tests during development):

```bash
# Terminal 1
pnpm test-server

# Terminal 2
npx vitest
```

## Database Migrations

Migrations live in `server/db/migrations/`. To generate a new migration after editing the schema:

```bash
pnpm drizzle-kit generate
```

To generate a named custom migration (e.g. for manual SQL):

```bash
pnpm drizzle-kit generate --custom --name=<migration_name>
```

To apply all pending migrations:

```bash
pnpm drizzle-kit push
```

## Docker

If the database doesn't exist yet, complete the [Getting Started](#getting-started) steps first.

### Build

```bash
docker build --tag sge-lims .
```

For a specific target architecture:

```bash
docker build --platform linux/amd64 --tag sge-lims .
# or
docker build --platform linux/arm64 --tag sge-lims .
```

### Run

Copy `.env.example` to `.env.docker` and change the database host from `localhost` to `host.docker.internal` so the container can reach your host's PostgreSQL instance:

```bash
cp .env.example .env.docker
# edit NUXT_DB_HOST=host.docker.internal
docker run -p 3000:3000 --env-file .env.docker sge-lims
```

For production deployments, see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).

## Project Structure

```
├── components/        # Shared Vue components (layout, forms, tables)
├── composables/       # Shared Vue composables
├── layouts/           # Nuxt layouts (default, empty)
├── middleware/        # Route middleware (auth guard)
├── pages/             # File-based routing
│   ├── admin/         # User and group management
│   ├── sge/           # SGE lab inventory pages
│   └── user/          # User account pages
├── public/            # Static assets and CSV/TSV import templates
├── server/
│   ├── api/           # Nitro API route handlers
│   ├── db/
│   │   ├── migrations/  # Drizzle migration files
│   │   └── schema/      # Drizzle table definitions
│   ├── middleware/    # Server-side middleware
│   ├── services/      # Business logic layer
│   └── utils/         # Server-side utilities
├── shared/            # Types and utilities shared by client and server
├── tests/             # Vitest test suites
└── utils/             # Client-side utilities
```

## Adding New Wellable Sample Types

When adding a new table for samples that will be stored in plates or storage boxes, the `wellables_insert`/`wellables_delete` trigger function and the `wellables` table constraint must be updated to include the new table.

After defining the table and its relations (following the pattern for existing sample types), append the following to the drizzle-kit generated migration file, or create a custom migration:

```sql
CREATE OR REPLACE TRIGGER "[new_table_name]_wellables_insert"
BEFORE INSERT ON "[new_table_name]"
FOR EACH ROW
EXECUTE FUNCTION wellables_insert();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "[new_table_name]_wellables_delete"
BEFORE DELETE ON "[new_table_name]"
FOR EACH ROW
EXECUTE FUNCTION wellables_delete();--> statement-breakpoint

ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "wellables" ADD CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      ...,
      '[new_table_name]'
    ));--> statement-breakpoint
```

> **Important:** Include all previous table names when redefining the `wellable_table_name` constraint. Refer to existing migration files for the current full list.
