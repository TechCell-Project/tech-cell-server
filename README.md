<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

# 🚀 Deployed

- RESTful API: [api.techcell.cloud](https://api.techcell.cloud)
- Documentations: [docs.techcell.cloud](https://docs.techcell.cloud)
- Source code docs: [design.techcell.cloud](https://design.techcell.cloud)

# 📖 Description

This application is built using a microservices architecture with [Nest](https://nestjs.com/) and [RabbitMQ](https://www.rabbitmq.com/). It includes the following features:

- **Infrastructure:**
  - Monorepo with [Nest Monorepo](https://docs.nestjs.com/cli/monorepo#monorepo-mode)
  - Containerization with [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
  - Message Broker with [RabbitMQ](https://www.rabbitmq.com/)
  - Cache with [Redis](https://redis.io/)
  - Database with [MongoDB](https://www.mongodb.com/)
  - Job queue with [BullMQ](https://bullmq.io/)
  - Deploy with [Google Cloud](https://cloud.google.com/), [Azure](https://azure.microsoft.com/), and other cloud services
  - Continuous Integration with [Github Actions](https://github.com/features/actions)
  - Reverse proxy with [Nginx](https://www.nginx.com/)
  - SSL with [Let's Encrypt](https://letsencrypt.org/), [ZeroSSL](https://zerossl.com/), and [Cloudflare](https://www.cloudflare.com/)
  - High availability with [HAProxy](https://www.haproxy.org/)

- **Features:**
  - User, Profile, Product, Order, Category, Notification, Attribute, Cart, Otp management ...
  - I18n with [i18n](https://www.npmjs.com/package/i18n)
  - Authentication with [JWT](https://jwt.io/)
  - Login, sign up with Credentials (email verified), Google
  - Storage with [Cloudinary](https://cloudinary.com/)
  - Custom domain emails with [Sendgrid](https://sendgrid.com/), [Resend](https://resend.com/), and [Gmail](https://mail.google.com/)
  - Notifications with [Socket.io](https://socket.io/), using job queue to send notifications
  - Cron jobs to clean unused data
  - Payment integration with [VNPay](https://vnpay.vn/)
  - Shipping integration with [GiaoHangNhanh](https://ghn.vn/)


# 📦 Installation

## ⚡ Require installed

- Docker, docker-compose ...
- Or custom install:
  * Nodejs: [nodejs 18](https://nodejs.org/en/blog/announcements/v18-release-announce)
  * Package Manager: [yarn](https://yarnpkg.com/)
  * Message Broker: [RabbitMQ](https://www.rabbitmq.com/)
  * Database: [Mongodb](https://www.mongodb.com/) with [replica set mode](https://www.mongodb.com/docs/manual/replication/) or [mongodb atlas](https://www.mongodb.com/docs/atlas/)
  * Cache: [Redis](https://redis.io/)

## ⚠️ Attention:
- [Ubuntu](https://ubuntu.com/) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows subsystems for Linux) is **recommended** for both development and production
- Windows is **not** recommended, can use in development **not** for production

## 📝 Before start

- Copy the .env.example and rename to .env.
- Change the default values to your own.

## 🐳 With docker, docker-compose

### 🔨 Services
- Core services:
  * Database
  * Message Broker
- Application services (each folder in `apps` folder is a service):
  * api
  * auth
  * search
  * .etc..

### Starting

#### First, you need to start the core services
```bash
yarn up:core # start core services
```

#### Then, you can start the application services
- `service_name` - optional: is the name of the service you want to start, by default it will start all services
```bash
yarn up:prod <service_name> # start all services in production mode
```

### Stopping
- `service_name` - optional: is the name of the service you want to start, by default it will start all services
```bash
yarn down:prod <service_name>  # stop all services
# or
yarn down:core # stop core services
```

### Restart and rebuild
- `service_name` - optional: is the name of the service you want to start, by default it will start all services
```bash
yarn restart:prod <service_name> # restart and rebuild all services 
# or
yarn restart:core # restart and rebuild core services
```

### Update the services
- `service_name` - optional: is the name of the service you want to start, by default it will start all services
- Update the services to the latest version from the docker registry
- Make sure your github repository is up to date
```bash
git pull # update the repository

yarn update:prod <service_name> # update core services
```

## 🦽 With manual run

### Required
- Make sure all the following core services have been installed and run successfully
  * RabbitMQ: port 5672
  * Mongodb: port 27017, replica set mode
  * Redis: port 6379
- Or you can run core services in docker and run app services manually
- Or you can using cloud services like [mongodb atlas](https://www.mongodb.com/cloud/atlas), [redis cloud](https://redislabs.com/redis-enterprise-cloud/overview/), [rabbitmq cloud](https://www.cloudamqp.com/)

### Starting
- `service_name` - optional: is the name of the service you want to start, by default it is `api` service
```bash
# You can run core services in docker and run app services manually

yarn start <service_name> # start the service as normal mode
yarn start:dev <service_name> # start the service as development mode
yarn start:prod <service_name> # start the service as production mode
```

### Stopping
```bash
# Just CTRL-C to stop the service
```

### Use Docker

- Check what is running on docker:
```bash
docker ps -a
```

- Get the log of a container:
```bash
docker logs <CONTAINER_ID> # get logs

docker logs -f <CONTAINER_ID> # get logs realtime
# Remember to replace `<CONTAINER_ID>` with the actual ID of the container you want to inspect.
```

- To remove all containers, volumes, and images that are not currently running, you can use the following commands:
```bash
docker container prune # remove all stopped containers
docker volume prune # remove all unused volumes
docker image prune # remove all unused images
# or just one
docker system prune -a # remove all stopped containers and unused volumes, images
```


## 🦽 License

Nest is [MIT licensed](LICENSE).
