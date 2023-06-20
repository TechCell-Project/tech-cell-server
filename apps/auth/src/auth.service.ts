import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    Inject,
    ConflictException,
    BadRequestException,
    NotFoundException,
    NotAcceptableException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import {
    ForgotPasswordDTO,
    LoginRequestDTO,
    ResendVerifyRegisterRequestDTO,
    UpdateRegisterRequestDTO,
    VerifyForgotPasswordDTO,
    VerifyRegisterRequestDTO,
} from '~/apps/auth/dtos';
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
import { catchError, throwError } from 'rxjs';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from '~/apps/mail/dtos';
import { OtpService } from '~/apps/auth/otp';

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

    async login({ email, password }: LoginRequestDTO): Promise<UserDataResponseDTO> {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new RpcException(
                new UnauthorizedException('Your username or password is incorrect'),
            );
        }
        delete user.password;

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

    async register({ email }: RegisterRequestDTO) {
        const userFound = await this.usersService.countUser({
            email,
        });

        if (userFound > 0) {
            throw new RpcException(new ConflictException('Email is already registered'));
        }

        const otp = await this.otpService.createOrRenewOtp({ email });
        await this.usersService.createUser({ email });

        const emailContext: ConfirmEmailRegisterDTO = {
            otpCode: otp.otpCode,
        };

        return this.mailService
            .send({ cmd: 'mail_send_confirm' }, { email, emailContext })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    async verifyRegister({ email, otpCode }: VerifyRegisterRequestDTO) {
        const userFound = await this.usersService.getUser({ email });

        if (userFound.emailVerified) {
            throw new RpcException(new BadRequestException('Email is already verified'));
        }

        const isVerified = await this.otpService.verifyOtp({ email, otpCode });

        if (!isVerified) {
            throw new RpcException(new BadRequestException('Email is not verified'));
        }

        await this.usersService.findOneAndUpdateUser(
            { email },
            { emailVerified: isVerified, requireUpdateInfo: true },
        );

        return {
            message: 'Email is verified, update your information now',
        };
    }

    async updateRegister({
        email,
        firstName,
        lastName,
        password,
        re_password,
    }: UpdateRegisterRequestDTO) {
        const isRequireUpdate = (await this.usersService.getUser({ email })).requireUpdateInfo;
        if (!isRequireUpdate) {
            throw new RpcException(new BadRequestException('No need to update'));
        }

        if (password !== re_password) {
            throw new RpcException(new BadRequestException('Password does not match'));
        }

        await this.usersService.findOneAndUpdateUser(
            { email },
            {
                firstName,
                lastName,
                password: await this.usersService.hashPassword(password),
                requireUpdateInfo: false,
            },
        );

        return {
            message: 'Update registration successful',
        };
    }

    async resendRegister({ email }) {
        const userFound = await this.usersService.getUser({
            email,
        });

        if (userFound && !userFound.requireUpdateInfo) {
            throw new RpcException(new UnprocessableEntityException('Email is already verified'));
        }

        const otp = await this.otpService.createOrRenewOtp({ email });

        const emailContext: ConfirmEmailRegisterDTO = {
            otpCode: otp.otpCode,
        };

        return this.mailService
            .send({ cmd: 'mail_send_confirm' }, { email, emailContext })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
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

    // async forgotPassword({ email }: ForgotPasswordDTO) {
    //     const userFound = await this.usersService.getUser({ email });
    //     if (!userFound) {
    //         throw new RpcException(new UnauthorizedException('User not found'));
    //     }
    //     if (!userFound.emailVerified) {
    //         throw new RpcException(new UnprocessableEntityException('Verify you email first'));
    //     }
    //     const otpExpiresMinute = Number(process.env.OTP_EXPIRE_TIME) || 5;

    //     const { otpCode, otpExpires } = this.createOtp({
    //         expMinutes: otpExpiresMinute,
    //         oldOtp: userFound.otp.otpCode,
    //     });
    //     const userUpdated = await this.usersService.findOneAndUpdateUser(userFound, {
    //         otp: { otpCode, otpExpires },
    //     });
    //     const emailContext: ForgotPasswordEmailDTO = {
    //         userEmail: userUpdated.email,
    //         firstName: userUpdated.firstName,
    //         verifyCode: userUpdated.otp.otpCode,
    //         expMinutes: otpExpiresMinute,
    //     };

    //     return this.mailService
    //         .send({ cmd: 'mail_send_forgot_password' }, { ...emailContext })
    //         .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    // }

    async verifyForgotPassword({ email, otpCode, password, re_password }: VerifyForgotPasswordDTO) {
        if (password !== re_password) {
            throw new RpcException(new BadRequestException('Password does not match'));
        }
        const userFound = await this.usersService.getUser({ email });
        if (!userFound) {
            throw new RpcException(new NotFoundException('User not found'));
        }
        // const isValidOtp = this.verifyOtp(otpCode, userFound.otp as OtpDTO);
        // if (!isValidOtp) {
        //     throw new RpcException(new UnauthorizedException('Can not verify you otp'));
        // }

        await this.usersService.changeUserPassword(userFound.email, password);
        // await this.usersService.findOneAndUpdateUser(
        //     { email: userFound.email },
        //     {
        //         otp: {
        //             otpCode: '',
        //             otpExpires: 0,
        //         },
        //     },
        // );

        return {
            message: 'Your password has been changed',
        };
    }

    // Utils below

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.getUser({ email });

        const doesUserExist = !!user;
        if (!doesUserExist) return null;

        if (user.requireUpdateInfo || user.password === '') {
            throw new RpcException(new NotAcceptableException('User requires update info'));
        }

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
