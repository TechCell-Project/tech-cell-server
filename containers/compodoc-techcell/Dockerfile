FROM node:18-alpine

WORKDIR /usr/src/app

COPY . . 

# Remove old package.json and yarn.lock
RUN rm -f package*.json && rm -f yarn.lock

# Initialize a new package.json
RUN npm init -y
COPY tsconfig*.json ./

# Install dependencies
RUN yarn add rimraf @compodoc/compodoc @babel/plugin-proposal-private-methods

CMD ["node", "scripts/run-compodoc.js", "--serve"]