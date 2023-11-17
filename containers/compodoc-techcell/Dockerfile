FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY . . 

# Remove old package.json and yarn.lock
RUN rm -f package*.json && rm -f yarn.lock

# Initialize a new package.json
RUN npm init -y
COPY tsconfig*.json ./

# Install dependencies
RUN yarn add rimraf @compodoc/compodoc @babel/plugin-proposal-private-methods
RUN node ./scripts/run-compodoc.js --build

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --from=build-stage /usr/src/app/ ./

CMD ["node", "scripts/run-compodoc.js", "--serve"]
