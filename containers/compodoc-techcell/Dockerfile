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

CMD ["node", "scripts/run-compodoc.js", "--build"]


FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Install dependencies
RUN yarn add @compodoc/compodoc @babel/plugin-proposal-private-methods

COPY --from=build-stage /usr/src/app/compodoc ./compodoc
COPY --from=build-stage /usr/src/app/scripts/run-compodoc.js ./scripts/run-compodoc.js

CMD ["node", "scripts/run-compodoc.js", "--serve"]
