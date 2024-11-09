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
