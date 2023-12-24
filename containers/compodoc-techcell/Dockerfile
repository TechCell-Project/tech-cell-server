FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

COPY . . 

RUN yarn workspaces focus --all
RUN node ./scripts/run-compodoc.js --build

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --from=build-stage /usr/src/app/ ./

CMD ["node", "scripts/run-compodoc.js", "--serve"]
