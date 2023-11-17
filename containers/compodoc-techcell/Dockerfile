FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY . . 

# Install dependencies
RUN yarn install
RUN node ./scripts/run-compodoc.js --build

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --from=build-stage /usr/src/app/ ./

CMD ["node", "scripts/run-compodoc.js", "--serve"]
