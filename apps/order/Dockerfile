FROM node:18 AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . . 

RUN yarn run build order

FROM node:18 as production

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --prod

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/order/main"]