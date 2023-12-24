FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn workspaces focus --all

COPY . . 

RUN yarn run build search

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn workspaces focus --production

COPY --from=build-stage /usr/src/app/dist ./dist
COPY --from=build-stage /usr/src/app/libs/common/src/i18n ./libs/common/src/i18n

CMD ["node", "dist/apps/search/main"]
