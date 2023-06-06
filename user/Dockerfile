FROM node:18
RUN npm install -g yarn@1.22.19 --force
RUN mkdir -p /var/www/user
WORKDIR /var/www/user
ADD . /var/www/user
RUN yarn install
CMD yarn build && yarn start:prod
