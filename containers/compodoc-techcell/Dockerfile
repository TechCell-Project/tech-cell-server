FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock tsconfig*.json ./

COPY . . 

CMD ["node", "scripts/run-compodoc.js", "--serve"]