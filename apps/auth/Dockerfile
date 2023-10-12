FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . . 

RUN yarn run build auth

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --prod

COPY --from=build-stage /usr/src/app/dist ./dist

RUN yarn start auth
