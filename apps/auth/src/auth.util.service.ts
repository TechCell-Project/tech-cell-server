import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '@app/resource/users';
import { User } from '@app/resource/users/schemas';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from '~/apps/auth/dtos';
import * as bcrypt from 'bcrypt';
import { RpcException, ClientRMQ } from '@nestjs/microservices';
import { MAIL_SERVICE, REDIS_CACHE, REQUIRE_USER_REFRESH } from '~/constants';
import { catchError, throwError } from 'rxjs';
import { ConfirmEmailRegisterDTO } from '~/apps/mail/dtos';
import { OtpService, OtpType } from '@app/resource/otp';
import { Store } from 'cache-manager';

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

    cleanUserBeforeResponse(user: User) {
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

    async sendMailOtp({ email, otpType, cmd }: { email: string; otpType: OtpType; cmd: string }) {
        const otp = await this.otpService.createOrRenewOtp({ email, otpType });
        const emailContext: ConfirmEmailRegisterDTO = {
            otpCode: otp.otpCode,
        };

        return this.mailService
            .send({ cmd }, { email, emailContext })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.getUser({ email });

        const doesUserExist = !!user;
        if (!doesUserExist) return null;

        const doesPasswordMatch = await this.doesPasswordMatch(password, user.password);
        if (!doesPasswordMatch) return null;

        return user;
    }

    async doesPasswordMatch(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
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
