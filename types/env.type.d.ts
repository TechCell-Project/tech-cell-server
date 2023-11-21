declare namespace NodeJS {
    interface ProcessEnv {
        /**
         * HTTP port of api gateway service
         */
        API_PORT: string;

        /**
         * HTTP port of communications service
         */
        COMMUNICATIONS_PORT: string;

        /**
         * The Global TTL(Time to live) of throttle
         * @description This value is used for `throttle` module, and is a second unit
         * @example
         * THROTTLE_GLOBAL_TTL = 60 // means 60 seconds
         */
        THROTTLE_GLOBAL_TTL: string;

        /**
         * The Global limit of throttle
         * @description This value is used for `throttle` module
         * @example
         * THROTTLE_GLOBAL_LIMIT = 10 // means 10 requests per `TTL`
         */
        THROTTLE_GLOBAL_LIMIT: string;

        /**
         * Sender of email server
         * @description This value is used for `nodemailer` module
         * @default 'TechCell Teams <teams@techcell.cloud>'
         * @example
         * EMAIL_SENDER = 'Example <example@techcell.cloud>'
         */
        MAIL_SENDER: string;

        /**
         * Host of email server
         * @description This value is used for `nodemailer` module
         * @example
         * EMAIL_HOST = 'smtp.gmail.com'
         */
        GMAIL_HOST: string;

        /**
         * User of email server
         * @description This value is used for `nodemailer` module
         * @example
         * EMAIL_USER = 'example'
         */
        GMAIL_USER: string;

        /**
         * Password of email server
         * @description This value is used for `nodemailer` module
         * @example
         * EMAIL_PASSWORD = 'example'
         */
        GMAIL_PASSWORD: string;

        /**
         * The gmail host
         * @description This value is used for `nodemailer` module
         * @example
         * GMAIL_HOST = 'smtp.gmail.com'
         * @see https://nodemailer.com/smtp/well-known/
         * @see https://support.google.com/a/answer/176600?hl=en
         */
        SENDGRID_HOST: string;

        /**
         * The gmail user
         * @description This value is used for `nodemailer` module
         * @example
         * SENDGRID_USER = 'apikey'
         */
        SENDGRID_USER: string;

        /**
         * The gmail password
         * @description This value is used for `nodemailer` module
         * @example
         * SENDGRID_PASSWORD = 'example'
         */
        SENDGRID_PASSWORD: string;

        /**
         * The resend data
         */
        RESEND_HOST: string;
        /**
         * The resend data
         */
        RESEND_USER: string;
        /**
         * The resend data
         */
        RESEND_API_KEY: string;

        /**
         * The expire time of `OTP` code
         * @description This value is used for `OTP` module
         * @example
         * OTP_EXPIRE_TIME = 60 // means 60 seconds
         * @see https://www.npmjs.com/package/otp-generator
         */
        OTP_EXPIRE_TIME_STRING: string;

        /**
         * The secret key of `accessToken`
         * @description This value is used for `JWT` module
         * @example
         * JWT_ACCESS_TOKEN_SECRET = 'the-example-secret-key'
         */
        JWT_ACCESS_TOKEN_SECRET: string;

        /**
         * The secret key of `refreshToken`
         * @description This value is used for `JWT` module
         * @example
         * JWT_REFRESH_TOKEN_SECRET = 'the-example-secret-key'
         */
        JWT_REFRESH_TOKEN_SECRET: string;

        /**
         * The expire time of `accessToken`
         * @description This value is used for `JWT` module
         * @example
         * JWT_ACCESS_TOKEN_EXPIRE_TIME = 15m // means 15 mins
         */
        JWT_ACCESS_TOKEN_EXPIRE_TIME_STRING: string;

        /**
         * The expire time of `refreshToken`
         * @description This value is used for `JWT` module
         * @example
         * JWT_REFRESH_TOKEN_EXPIRE_TIME = 7d // means 7 days
         */
        JWT_REFRESH_TOKEN_EXPIRE_TIME_STRING: string;

        /**
         * The mongodb uri
         * @description This value is used for `mongoose` module
         * @example
         * MONGODB_URI = 'mongodb://localhost:27017/techcell'
         */
        MONGODB_URI: string;

        /**
         * The mongodb root password
         * @description This value is used when setting up mongodb with `docker compose`
         * @example
         * SET_MONGODB_ROOT_PASSWORD = 'example'
         */
        SET_MONGODB_ROOT_PASSWORD: string;

        /**
         * The mongodb replica set key
         * @description This value is used when setting up mongodb with `docker compose`
         * @example
         * SET_MONGODB_REPLICA_SET_KEY = 'example'
         */
        SET_MONGODB_REPLICA_SET_KEY: string;

        /**
         * The `RabbitMq` urls
         * @description This value is used for `amqplib` module and is a comma separated list
         * @example
         * RABBITMQ_URLS = amqp://localhost:5672, amqp://localhost:5673
         * @see https://www.rabbitmq.com/uri-spec.html
         */
        RABBITMQ_URLS: string;

        /**
         * The `RabbitMq` utility queue
         * @description This value is used for `amqplib` module
         * @example
         * RABBITMQ_UTILITY_QUEUE = 'utility-queue'
         */
        RABBITMQ_UTILITY_QUEUE: string;
        RABBITMQ_SEARCH_QUEUE: string;
        RABBITMQ_AUTH_QUEUE: string;
        RABBITMQ_COMMUNICATIONS_QUEUE: string;
        RABBITMQ_MANAGEMENTS_QUEUE: string;
        RABBITMQ_ORDER_QUEUE: string;
        RABBITMQ_TASK_QUEUE: string;

        /**
         * The `RabbitMq` default user
         * @description This value is used for `amqplib` module
         * @example
         * RABBITMQ_DEFAULT_USER = 'guest'
         * @see https://www.rabbitmq.com/access-control.html
         * @see https://www.rabbitmq.com/access-control.html#default-user
         */
        RABBITMQ_DEFAULT_USER: string;

        /**
         * The `RabbitMq` default password
         * @description This value is used for `amqplib` module
         * @example
         * RABBITMQ_DEFAULT_PASS = 'guest'
         * @see https://www.rabbitmq.com/access-control.html
         * @see https://www.rabbitmq.com/access-control.html#default-user
         */
        RABBITMQ_DEFAULT_PASS: string;

        /**
         * The `Redis` default host
         * @example
         * REDIS_HOST = 'localhost'
         */
        REDIS_HOST: string;

        /**
         * The `Redis` default port
         * @example
         * REDIS_PORT = '6379'
         * @see https://redis.io/topics/quickstart
         */
        REDIS_PORT: string;

        /**
         * The `Redis` default password
         * @example
         * REDIS_PASSWORD = 'example'
         * @see https://redis.io/topics/quickstart
         * @see https://redis.io/topics/security
         * @see https://redis.io/topics/encryption
         */
        REDIS_PASSWORD: string;

        /**
         * The `Google Client ID` for `OAuth2`
         * @description This value is used for `passport-google-oauth20` module
         * @example
         * GOOGLE_CLIENT_ID = 'example'
         * @see https://console.developers.google.com/apis/credentials
         * @see https://developers.google.com/identity/protocols/oauth2
         * @see https://developers.google.com/identity/protocols/oauth2/scopes
         * @see https://developers.google.com/identity/protocols/oauth2/openid-connect
         */
        GOOGLE_CLIENT_ID: string;

        /**
         * The `Google Client Secret` for `OAuth2`
         * @description This value is used for `passport-google-oauth20` module
         * @example
         * GOOGLE_CLIENT_SECRET = 'example'
         * @see https://console.developers.google.com/apis/credentials
         * @see https://developers.google.com/identity/protocols/oauth2
         * @see https://developers.google.com/identity/protocols/oauth2/scopes
         * @see https://developers.google.com/identity/protocols/oauth2/openid-connect
         */
        GOOGLE_CLIENT_SECRET: string;

        /**
         * The `Google Redirect URL` for `OAuth2`
         * @description This value is used for `passport-google-oauth20` module
         * @example
         * GOOGLE_REDIRECT_URL = 'http://localhost:3000/auth/google'
         * @see https://console.developers.google.com/apis/credentials
         * @see https://developers.google.com/identity/protocols/oauth2
         * @see https://developers.google.com/identity/protocols/oauth2/scopes
         * @see https://developers.google.com/identity/protocols/oauth2/openid-connect
         */
        GOOGLE_REDIRECT_URL: string;

        /**
         * The `Facebook App ID` for `OAuth2`
         * @description This value is used for `passport-facebook` module
         * @example
         * FACEBOOK_APP_ID = 'example'
         * @see https://developers.facebook.com/apps
         * @see https://developers.facebook.com/docs/facebook-login
         */
        FACEBOOK_APP_ID: string;

        /**
         * The `Facebook App Secret` for `OAuth2`
         * @description This value is used for `passport-facebook` module
         * @example
         * FACEBOOK_APP_SECRET = 'example'
         * @see https://developers.facebook.com/apps
         * @see https://developers.facebook.com/docs/facebook-login
         */
        FACEBOOK_APP_SECRET: string;

        /**
         * The `Facebook Redirect URL` for `OAuth2`
         * @description This value is used for `passport-facebook` module
         * @default 'http://localhost:3000/auth/facebook'
         * @example
         * FACEBOOK_REDIRECT_URL = 'http://localhost:3000/auth/facebook'
         * @see https://developers.facebook.com/apps
         * @see https://developers.facebook.com/docs/facebook-login
         */
        FACEBOOK_REDIRECT_URL: string;

        /**
         * The env to enable all `Logs`
         * @description `true/1/on` to enable, otherwise disable
         * @example
         * LOGS_IS_ENABLE = true
         */
        LOGS_IS_ENABLE: string | boolean;

        /**
         * The env to enable `Console` logs
         * @description `true/1/on` to enable, otherwise disable
         * @example
         * LOGS_TO_CONSOLE = true
         */
        LOGS_TO_CONSOLE: string | boolean;

        /**
         * The env to enable `File` logs
         * @description `true/1/on` to enable, otherwise disable
         * @example
         * LOGS_TO_FILE = true
         */
        LOGS_TO_FILE: string | boolean; // `true/1/on` to enable, otherwise disable

        /**
         * The env to enable `Discord` logs
         * @description `true/1/on` to enable, otherwise disable
         * @example
         * DISCORD_IS_ENABLE = true
         */
        LOGS_TO_DISCORD: string | boolean;

        /**
         * The `Discord` token
         * @description This value is used for `discord.js` module
         * @example
         * DISCORD_TOKEN = 'example'
         */
        DISCORD_TOKEN: string;

        /**
         * The `Discord` logs channel id
         * @description This value is used for `discord.js` module
         * @example
         * DISCORD_LOGS_CHANNEL_ID = example
         */
        DISCORD_LOGS_CHANNEL_ID: string;

        /**
         * The `cloud_name` of `Cloudinary`
         * @description This value is used for `cloudinary` module
         * @example
         * CLOUDINARY_CLOUD_NAME = example
         * @see https://cloudinary.com/documentation/image_upload_api_reference#upload_method
         */
        CLOUDINARY_CLOUD_NAME: string;

        /**
         * The `api_key` of `Cloudinary`
         * @description This value is used for `cloudinary` module
         * @example
         * CLOUDINARY_API_KEY = example
         */
        CLOUDINARY_API_KEY: string;

        /**
         * The `api_secret` of `Cloudinary`
         * @description This value is used for `cloudinary` module
         * @example
         * CLOUDINARY_API_SECRET = example
         */
        CLOUDINARY_API_SECRET: string;

        /**
         * The `vnpay` data
         */
        VNPAY_VERSION: string;
        /**
         * The `vnpay` data
         */
        VNPAY_PAYMENT_URL: string;
        /**
         * The `vnpay` data
         */
        VNPAY_TMN_CODE: string;
        /**
         * The `vnpay` data
         */
        VNPAY_SECRET_KEY: string;
        /**
         * The `vnpay` data
         */
        VNPAY_CURR_CODE: string;
        /**
         * The `vnpay` data
         */
        VNPAY_LOCALE: string;
        /**
         * The `vnpay` data
         */
        VNPAY_RETURN_URL: string;
        /**
         * The `vnpay` data
         */

        /**
         * The `giaohangnhanh` data
         */
        GHN_URL: string;
        /**
         * The `giaohangnhanh` data
         */
        GHN_API_TOKEN: string;
        /**
         * The `giaohangnhanh` data
         */
        GHN_SHOP_ID: string;
    }
}
