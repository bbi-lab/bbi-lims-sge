# BBI LIMS Nuxt+Drizzle

Laborartory Inventory Management System built using Nuxt framework and Drizzle ORM.

## Quickstart

Install pnpm:
```
npm install -g pnpm
```

Install dependencies:
```
pnpm i
```

Create a new local postgresql database,
Copy `.env.example` to `.env` and update the database URL,
then run drizzle-kit push:
```
pnpm drizzle-kit push
```

Launch!
```
pnpm run dev
```

## Docker

If the database doesn't exist yet, create a new one using the steps above.

Build the docker image:
```
docker build --tag sge-lims .
```
Or for a specific architecture (e.g. linux/arm64, linux/amd64):
```
docker build --platform linux/arm64 --tag sge-lims .
```

Copy `.env.example` to `.env.docker` and change the database URL's host from `localhost` to `host.docker.internal`.

Start a docker container:
```
docker run -p 3000:3000 --env-file .env.docker sge-lims
```


Check out the Nuxt [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


## Adding new wellabe sample types

When adding a new table for samples that will be stored in plates or storage boxes, trigger function and the wellables table constraint must be updated to include the new table.

After defining the table and relations (following the pattern for existing sample types), you will need to append the following to the resulting drizzle-kit generated migration file, or create a custom migration file with `pnpm drizzle-kit generate --custom --name=[migration_name]`

```
CREATE OR REPLACE TRIGGER "[new_table_name]_wellables_insert"
BEFORE INSERT ON "[new_table_name]"
FOR EACH ROW
EXECUTE FUNCTION wellables_insert();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "[new_table_name]_wellables_delete"
BEFORE DELETE ON "[new_table_name]""
FOR EACH ROW
EXECUTE FUNCTION wellables_delete();--> statement-breakpoint

ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "wellables" ADD CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      ...,
      '[table_name]',
      ...
    ));--> statement-breakpoint
```

Be sure to include all previous table names when redefining wellable_table_name constraint. Examples and most recent constraint definition can be found in existing migration files.
