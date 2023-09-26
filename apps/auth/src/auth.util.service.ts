import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '@app/resource/users';
import { User } from '@app/resource/users/schemas';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from '~/apps/auth/dtos';
import * as bcrypt from 'bcrypt';
import { RpcException, ClientRMQ } from '@nestjs/microservices';
import { MAIL_SERVICE, REDIS_CACHE, REQUIRE_USER_REFRESH } from '~/constants';
import { OtpService } from '@app/resource/otp';
import { Store } from 'cache-manager';
import {
    buildRevokeAccessTokenKey,
    buildRevokeRefreshTokenKey,
    buildUniqueUserNameFromEmail,
    isEmail,
    timeStringToMs,
} from '@app/common';

@Injectable()
export class AuthUtilService {
    constructor(
        protected jwtService: JwtService,
        protected usersService: UsersService,
        protected configService: ConfigService,
        @Inject(MAIL_SERVICE) protected mailService: ClientRMQ,
        protected readonly otpService: OtpService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
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
        const userFound = await this.cacheManager.get(cacheUserKey);
        if (userFound) {
            return true;
        }
        return false;
    }

    protected async removeRequireRefresh(userId: string) {
        const cacheUserKey = `${REQUIRE_USER_REFRESH}_${userId}`;
        await this.cacheManager.del(cacheUserKey);
    }

    protected cleanUserBeforeResponse(user: User) {
        delete user.password;
        if (user.block) delete user.block;
        return user;
    }

    async buildUserTokenResponse(user: User) {
        const { _id, email, role } = user;
        const { accessToken, refreshToken } = await this.signTokens({
            _id,
            email,
            role,
        });

        return { accessToken, refreshToken, ...this.cleanUserBeforeResponse(user) };
    }

    async validateUserLogin(emailOrUsername: string, password: string) {
        const query = isEmail(emailOrUsername)
            ? { email: emailOrUsername }
            : { userName: emailOrUsername };
        const user = await this.usersService.getUser(query, { lean: true });

        const doesUserExist = !!user;
        if (!doesUserExist) return false;

        const doesPasswordMatch = await this.doesPasswordMatch(password, user.password);
        if (!doesPasswordMatch) return false;

        return user;
    }

    async doesPasswordMatch(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    protected async revokeAccessToken(accessToken: string): Promise<boolean> {
        try {
            const revokeAccessTokenKey = buildRevokeAccessTokenKey(accessToken);
            await this.cacheManager.set(
                revokeAccessTokenKey,
                {
                    revoked: true,
                    accessToken,
                },
                timeStringToMs(process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_STRING),
            );
            return true;
        } catch (error) {
            Logger.error(`Error when revoke access token: ${error.message}`);
            return false;
        }
    }

    protected async isAccessTokenRevoked(accessToken: string): Promise<boolean> {
        try {
            const revokeAccessTokenKey = buildRevokeAccessTokenKey(accessToken);
            const isRevoked = await this.cacheManager.get(revokeAccessTokenKey);
            if (isRevoked) return true;
            return false;
        } catch (error) {
            Logger.error(`Error when check revoked access token: ${error.message}`);
            return true;
        }
    }

    protected async revokeRefreshToken(refreshToken: string): Promise<boolean> {
        try {
            const revokeRefreshTokenKey = buildRevokeRefreshTokenKey(refreshToken);
            await this.cacheManager.set(
                revokeRefreshTokenKey,
                {
                    revoked: true,
                    refreshToken,
                },
                timeStringToMs(process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME_STRING),
            );
            return true;
        } catch (error) {
            Logger.error(`Error when revoke refresh token: ${error.message}`);
            return false;
        }
    }

    protected async isRefreshTokenRevoked(refreshToken: string): Promise<boolean> {
        try {
            const revokeRefreshTokenKey = buildRevokeRefreshTokenKey(refreshToken);
            const isRevoked = await this.cacheManager.get(revokeRefreshTokenKey);
            if (isRevoked) return true;
            return false;
        } catch (error) {
            Logger.error(`Error when check revoked refresh token: ${error.message}`);
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
                    new UnauthorizedException('Token has expired, please login again.'),
                );
            }
            throw new RpcException(new UnauthorizedException('Invalid token, please login again.'));
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
}
