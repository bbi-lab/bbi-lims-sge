ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-slim AS base

ARG PORT=3000

WORKDIR /src

# Build
FROM base AS build

COPY --link package.json package.json .
COPY --link pnpm-lock.yaml pnpm-lock.yaml .
COPY --link pnpm-workspace.yaml pnpm-workspace.yaml .
COPY patches ./patches/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY --link . .

RUN pnpm run build

# Run
FROM base

ENV PORT=$PORT
ENV NODE_ENV=production

COPY --from=build /src/.output /src/.output
# Optional, only needed if you rely on unbundled dependencies
COPY --from=build /src/node_modules /src/node_modules

CMD [ "node", ".output/server/index.mjs" ]
