FROM node:18
RUN npm install -g yarn@1.22.19 --force
RUN mkdir -p /var/www/gateway
WORKDIR /var/www/gateway
ADD . /var/www/gateway
RUN yarn install
CMD yarn build && yarn start:prod
