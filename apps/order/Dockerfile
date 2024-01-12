FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn workspaces focus --all

COPY . . 

RUN yarn run build order

FROM node:18-alpine AS production

USER node

WORKDIR /usr/src/app

COPY --chown=node package.json yarn.lock .yarnrc.yml ./
COPY --chown=node .yarn ./.yarn

RUN yarn workspaces focus --production && yarn cache clean --all

COPY --from=build-stage --chown=node /usr/src/app/dist ./dist
COPY --from=build-stage --chown=node /usr/src/app/libs/common/src/i18n ./libs/common/src/i18n

CMD ["node", "dist/apps/order/main"]
