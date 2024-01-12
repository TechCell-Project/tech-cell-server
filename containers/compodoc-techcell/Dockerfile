FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

COPY . . 

RUN yarn workspaces focus --all && yarn cache clean --all
RUN node ./scripts/run-compodoc.js --build
RUN rm -rf ./node_modules

FROM node:18-alpine AS production

USER node

WORKDIR /usr/src/app

COPY --from=build-stage --chown=node /usr/src/app/ ./

CMD ["node", "scripts/run-compodoc.js", "--serve"]
