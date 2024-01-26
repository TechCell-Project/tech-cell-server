import {
    Injectable,
    Inject,
    Logger,
    HttpException,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '~libs/resource/users';
import { User } from '~libs/resource/users/schemas';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto, UserDataResponseDTO } from '~apps/auth/dtos';
import * as bcrypt from 'bcrypt';
import { RpcException, ClientRMQ } from '@nestjs/microservices';
import { COMMUNICATIONS_SERVICE, REQUIRE_USER_REFRESH } from '~libs/common/constants';
import { OtpService } from '~libs/resource/otp';
import {
    buildRevokeAccessTokenKey,
    buildRevokeRefreshTokenKey,
    buildUniqueUserNameFromEmail,
    isEmail,
} from '~libs/common';
import { convertTimeString, TimeUnitOutPut } from 'convert-time-string';
import { cleanUserBeforeResponse } from '~libs/resource/users/utils';
import { RedisService } from '~libs/common/Redis/services';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class AuthUtilService {
    protected readonly logger = new Logger(AuthUtilService.name);
    constructor(
        protected jwtService: JwtService,
        protected usersService: UsersService,
        protected configService: ConfigService,
        @Inject(COMMUNICATIONS_SERVICE) protected communicationsService: ClientRMQ,
        protected readonly otpService: OtpService,
        protected redisService: RedisService,
        @I18n() protected readonly i18n: I18nService<I18nTranslations>,
    ) {}

    // Utils below
    protected async createUniqueUserName(email: string) {
        const userName = buildUniqueUserNameFromEmail(email);
        try {
            await this.usersService.getUser({
                userName: userName.toString(),
            });
            return await this.createUniqueUserName(email);
        } catch (error) {
            return userName;
        }
    }

    protected async checkIsRequiredRefresh(userId: string) {
        const cacheUserKey = `${REQUIRE_USER_REFRESH}_${userId}`;
        const userFound = await this.redisService.get(cacheUserKey);
        if (userFound) {
            return true;
        }
        return false;
    }

    protected async removeRequireRefresh(userId: string) {
        const cacheUserKey = `${REQUIRE_USER_REFRESH}_${userId}`;
        await this.redisService.del(cacheUserKey);
    }

    async buildUserTokenResponse(user: User): Promise<UserDataResponseDTO> {
        const { _id, email, role } = user;
        const { accessToken, refreshToken } = await this.signTokens({
            _id,
            email,
            role,
        });

        return { accessToken, refreshToken, ...cleanUserBeforeResponse(user) };
    }

    async validateUserLogin(emailOrUsername: string, password: string): Promise<User | null> {
        const query = isEmail(emailOrUsername)
            ? { email: emailOrUsername }
            : { userName: emailOrUsername };

        let user: User;
        try {
            user = await this.usersService.getUser(query, { lean: true });
        } catch (error) {
            user = null;
        }

        if (!user) return null;

        const doesPasswordMatch = await this.doesPasswordMatch(password, user.password);
        if (!doesPasswordMatch) return null;

        return user;
    }

    async doesPasswordMatch(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    protected async revokeAccessToken(accessToken: string): Promise<boolean> {
        try {
            const revokeAccessTokenKey = buildRevokeAccessTokenKey(accessToken);
            await this.redisService.set(
                revokeAccessTokenKey,
                {
                    revoked: true,
                    accessToken,
                },
                convertTimeString(
                    process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_STRING,
                    TimeUnitOutPut.MILLISECOND,
                ),
            );
            return true;
        } catch (error) {
            this.logger.error(`Error when revoke access token: ${error.message}`);
            return false;
        }
    }

    protected async isAccessTokenRevoked(accessToken: string): Promise<boolean> {
        try {
            const revokeAccessTokenKey = buildRevokeAccessTokenKey(accessToken);
            const isRevoked = await this.redisService.get(revokeAccessTokenKey);
            if (isRevoked) return true;
            return false;
        } catch (error) {
            this.logger.error(`Error when check revoked access token: ${error.message}`);
            return true;
        }
    }

    protected async revokeRefreshToken(refreshToken: string): Promise<boolean> {
        try {
            const revokeRefreshTokenKey = buildRevokeRefreshTokenKey(refreshToken);
            const isExitsInStore = await this.redisService.get<{
                refreshToken: string;
                usedTimeRemaining?: number;
            }>(revokeRefreshTokenKey);

            if (isExitsInStore && isExitsInStore?.usedTimeRemaining > 1) {
                await this.redisService.set(
                    revokeRefreshTokenKey,
                    {
                        refreshToken,
                        usedTimeRemaining: isExitsInStore?.usedTimeRemaining - 1,
                    },
                    convertTimeString(process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME_STRING),
                );
                return true;
            }

            await this.redisService.set(
                revokeRefreshTokenKey,
                {
                    refreshToken,
                    usedTimeRemaining:
                        process.env.JWT_REFRESH_TOKEN_MAX_USED_TIME !== undefined
                            ? +process.env.JWT_REFRESH_TOKEN_MAX_USED_TIME
                            : 5,
                },
                convertTimeString(process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME_STRING),
            );
            return true;
        } catch (error) {
            this.logger.error(`Error when revoke refresh token: ${error.message}`);
            return false;
        }
    }

    protected async isRefreshTokenRevoked(refreshToken: string): Promise<boolean> {
        try {
            const revokeRefreshTokenKey = buildRevokeRefreshTokenKey(refreshToken);
            const isRevoked = await this.redisService.get<{
                refreshToken: string;
                usedTimeRemaining?: number;
            }>(revokeRefreshTokenKey);

            if (isRevoked && isRevoked?.usedTimeRemaining < 1) {
                return true;
            }

            return false;
        } catch (error) {
            this.logger.error(`Error when check revoked refresh token: ${error.message}`);
            return true;
        }
    }

    async verifyToken(token: string, secret: string) {
        try {
            const dataVerified = await this.jwtService.verifyAsync(token, {
                secret,
            });
            return dataVerified;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new RpcException(
                    new UnauthorizedException(
                        this.i18n.t('errorMessage.PROPERTY_IS_EXPIRED', {
                            args: {
                                property: 'Token',
                            },
                        }),
                    ),
                );
            }
            throw new RpcException(
                new UnauthorizedException(
                    this.i18n.t('errorMessage.PROPERTY_IS_INVALID', {
                        args: {
                            property: 'Token',
                        },
                    }),
                ),
            );
        }
    }

    async signTokens({ _id, email, role }: JwtPayloadDto) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    _id,
                    email,
                    role,
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                    expiresIn:
                        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE_TIME_STRING') ||
                        '15m',
                },
            ),
            this.jwtService.signAsync(
                {
                    _id,
                    email,
                    role,
                },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                    expiresIn:
                        this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE_TIME_STRING') ||
                        '7d',
                },
            ),
        ]);

        // Remove require refresh any time token is created or refreshed
        await this.removeRequireRefresh(_id.toString());

        return {
            accessToken,
            refreshToken,
        };
    }

    protected async limitEmailSent(email: string) {
        const cacheKey = `EMAIL_SENT_${email}`;
        const isEmailSentTimes = await this.redisService.get(cacheKey);
        if (!isEmailSentTimes) {
            return await this.redisService.set(cacheKey, { times: 1 }, convertTimeString('30m'));
        }

        const times = Number(isEmailSentTimes['times']);
        if (times >= 3) {
            throw new RpcException(
                new HttpException(
                    {
                        statusCode: HttpStatus.TOO_MANY_REQUESTS,
                        message: this.i18n.t('errorMessage.TOO_MANY_EMAIL_SENT'),
                    },
                    HttpStatus.TOO_MANY_REQUESTS,
                ),
            );
        }

        return await this.redisService.set(
            cacheKey,
            { times: times + 1 },
            convertTimeString('30m'),
        );
    }
}
