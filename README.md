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
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

- A microservices application building with [Nest](https://github.com/nestjs/nest) and [RabbitMQ](https://github.com/rabbitmq).
- Using [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/) to run locally and automatically

## ⚡ Require installed

- Docker, docker-compose ...
- Or custom install:
  * Package Manager: [yarn](https://yarnpkg.com/)
  * Database: [Mongodb](https://www.mongodb.com/) with [replica set mode](https://www.mongodb.com/docs/manual/replication/) or [mongodb atlas](https://www.mongodb.com/docs/atlas/)
  * Message Broker: [RabbitMQ](https://www.rabbitmq.com/)

## ⚠️ Attention:
- [Ubuntu](https://ubuntu.com/) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows subsystems for Linux) is **recommended** for both development and production
- Windows is **not** recommended, can use in development **not** for production

# 🚀 Use the app

## 📝 Before start

- Copy the .env.example and rename to .env
- Change the default environment variable values

## 🐳 With docker, docker-compose

### 🔨 Services
- Core services:
  * Database
  * Message Broker
- Application services
  * Api
  * etc...

### Starting
```bash
yarn up # start all services in production mode
# or
yarn up:core # start core services
```

### Stopping
```bash
yarn down # stop all services
# or
yarn down:core # stop core services
```

### Restart and rebuild
```bash
yarn restart # restart and rebuild all services 
# or
yarn restart:core # restart and rebuild core services
```

## 🦽 With manual run

### Required
- Make sure all the following core services have been installed and run successfully
  * RabbitMQ: port 5672
  * Mongodb: port 27017, replica set mode
- Or you can run core services in docker and run app services manually

### Starting
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

## 🦽 License

Nest is [MIT licensed](LICENSE).
