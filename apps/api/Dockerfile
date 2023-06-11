FROM node:18

WORKDIR /usr/src/techcell_app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .