import { Injectable, UnauthorizedException, Inject, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto, UserDataResponseDTO } from '~/apps/auth/dtos';
import * as bcrypt from 'bcrypt';
import { RpcException, ClientRMQ } from '@nestjs/microservices';
import { MAIL_SERVICE } from '~/constants';
import { catchError, throwError } from 'rxjs';
import { ConfirmEmailRegisterDTO } from '~/apps/mail/dtos';
import { OtpService, OtpType } from '~/apps/auth/otp';
import { User } from './users/schemas';

@Injectable()
export class AuthUtilService {
    constructor(
        protected jwtService: JwtService,
        protected usersService: UsersService,
        protected configService: ConfigService,
        @Inject(MAIL_SERVICE) protected mailService: ClientRMQ,
        protected readonly otpService: OtpService,
    ) {}

    // Utils below
    cleanUserBeforeResponse(user: User) {
        delete user.password;
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

    async verifyAccessToken(accessToken: string) {
        if (!accessToken) {
            throw new RpcException(new BadRequestException('Access token missing.'));
        }

        return await this.verifyToken(
            accessToken,
            this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        );
    }

    async verifyRefreshToken(refreshToken: string) {
        if (!refreshToken) {
            throw new RpcException(new BadRequestException('Refresh token missing.'));
        }

        const a = await this.verifyToken(
            refreshToken,
            this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        );

        console.log(a);

        return a;
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
                    expiresIn: '15m',
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
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}