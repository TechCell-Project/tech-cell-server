import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    Inject,
    ConflictException,
    BadRequestException,
    NotAcceptableException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import { CheckEmailRequestDTO, LoginRequestDTO, VerifyEmailRequestDTO } from '~/apps/auth/dtos';
import {
    JwtPayloadDto,
    RegisterRequestDTO,
    NewTokenRequestDTO,
    UserDataResponseDTO,
} from '~/apps/auth/dtos';
import * as bcrypt from 'bcrypt';
import { User } from './users/schemas';
import { RpcException, ClientRMQ } from '@nestjs/microservices';
import { MAIL_SERVICE } from '~/constants';
import { catchError, throwError, firstValueFrom } from 'rxjs';
import { ConfirmEmailRegisterDTO } from '~/apps/mail/dtos';
import { OtpService, OtpType } from '~/apps/auth/otp';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private configService: ConfigService,
        @Inject(MAIL_SERVICE) private mailService: ClientRMQ,
        private readonly otpService: OtpService,
    ) {}

    getPing() {
        return {
            message: 'pong',
            services: 'auth',
        };
    }

    async login({ email, password }: LoginRequestDTO) {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new RpcException(
                new UnauthorizedException('Your username or password is incorrect'),
            );
        }
        delete user.password;

        if (!user.emailVerified) {
            const otp = await this.otpService.createOrRenewOtp({
                email,
                otpType: OtpType.VerifyEmail,
            });
            const emailContext: ConfirmEmailRegisterDTO = {
                otpCode: otp.otpCode,
            };

            await firstValueFrom(
                this.mailService
                    .send({ cmd: 'mail_send_confirm' }, { email, emailContext })
                    .pipe(
                        catchError((error) => throwError(() => new RpcException(error.response))),
                    ),
            );

            throw new RpcException(
                new NotAcceptableException(
                    'Email is not verified, please check your email to verify it.',
                ),
            );
        }

        const { _id, email: emailUser, role } = user;
        const { accessToken, refreshToken } = await this.signTokens({
            _id,
            email: emailUser,
            role,
        });

        const userReturn: UserDataResponseDTO = Object.assign(user, {
            accessToken,
            refreshToken,
        });

        return userReturn;
    }

    async checkEmail({ email }: CheckEmailRequestDTO) {
        const userFound = await this.usersService.countUser({ email });

        if (userFound > 0) {
            throw new RpcException(new ConflictException('Email is already exists'));
        }

        return {
            message: 'Email is not in use',
        };
    }

    async register({ email, firstName, lastName, password, re_password }: RegisterRequestDTO) {
        let userFound: User;
        try {
            userFound = await this.usersService.getUser({
                email,
            });
        } catch (error) {
            userFound = undefined;
        }

        if (userFound || (userFound && userFound.emailVerified)) {
            throw new RpcException(new ConflictException('Email is already registered'));
        }

        if (password !== re_password) {
            throw new RpcException(new BadRequestException('Password does not match'));
        }

        userFound = await this.usersService.createUser({
            email,
            firstName,
            lastName,
            password,
        });

        return await this.sendMailOtp({
            email,
            otpType: OtpType.VerifyEmail,
            cmd: 'mail_send_confirm',
        });
    }

    async verifyEmail({ email, otpCode }: VerifyEmailRequestDTO) {
        const userFound = await this.usersService.getUser({ email });

        if (userFound.emailVerified) {
            throw new RpcException(new BadRequestException('Email is already verified'));
        }

        const isVerified = await this.otpService.verifyOtp({
            email,
            otpCode,
            otpType: OtpType.VerifyEmail,
        });

        if (!isVerified) {
            throw new RpcException(new UnprocessableEntityException('Email verify failed'));
        }

        await this.usersService.findOneAndUpdateUser({ email }, { emailVerified: isVerified });

        return {
            message: 'Email is verified, update your information now',
        };
    }

    async getNewToken({
        refreshToken: oldRefreshToken,
    }: NewTokenRequestDTO): Promise<UserDataResponseDTO> {
        try {
            if (!oldRefreshToken) {
                throw new RpcException(new BadRequestException('Refresh token is required'));
            }

            const { user } = await this.verifyRefreshToken(oldRefreshToken);
            const userFound = await this.usersService.getUser({ email: user.email });

            const { _id, email: emailUser, role } = userFound;
            const { accessToken, refreshToken } = await this.signTokens({
                _id,
                email: emailUser,
                role,
            });
            // const userReturn = Object.assign(user, { newAccessToken, newRefreshToken });
            return { ...user, accessToken, refreshToken };
        } catch (error) {
            throw new RpcException(new ForbiddenException());
        }
    }

    // Utils below

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

        return await this.verifyToken(
            refreshToken,
            this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        );
    }

    async verifyToken(token: string, secret: string) {
        try {
            const { user, exp } = await this.jwtService.verifyAsync(token, {
                secret,
            });
            return { user, exp };
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
