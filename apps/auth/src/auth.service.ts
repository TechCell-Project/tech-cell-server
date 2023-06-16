import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    UnprocessableEntityException,
    Inject,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import {
    LoginRequestDTO,
    ResendVerifyRegisterRequestDTO,
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
import { ConfirmEmailRegisterDTO } from '~/apps/mail/dtos';
import { OptDTO } from './users/dtos/otp.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private configService: ConfigService,
        @Inject(MAIL_SERVICE) private mailService: ClientRMQ,
    ) {}

    getPing() {
        return { message: 'pong', services: 'auth' };
    }

    async register(userRegister: RegisterRequestDTO) {
        const { email, password, re_password, firstName, lastName } = userRegister;

        if (password !== re_password) {
            throw new RpcException(new UnprocessableEntityException('Passwords do not match'));
        }

        const otpExpiresMinute = Number(process.env.OTP_EXPIRE_TIME) || 5;

        const userCreated = await this.usersService.createUser({
            email,
            password,
            firstName,
            lastName,
            otp: this.createOtp({ expMinutes: otpExpiresMinute }),
        });

        if (!userCreated) {
            throw new RpcException(
                new UnprocessableEntityException('Error occurred when creating user'),
            );
        }

        const emailUser: string = userCreated.email;
        const emailContext: ConfirmEmailRegisterDTO = {
            firstName: userCreated.firstName,
            lastName: userCreated.lastName,
            verifyCode: userCreated.otp.otpCode,
            expMinutes: otpExpiresMinute,
        };

        return this.mailService
            .send({ cmd: 'mail_send_confirm' }, { email: emailUser, emailContext: emailContext })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    async login({ email, password }: LoginRequestDTO): Promise<UserDataResponseDTO> {
        try {
            const user = await this.validateUser(email, password);

            if (!user) {
                throw new RpcException(new UnauthorizedException());
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
        } catch (error) {
            throw new RpcException(new UnauthorizedException());
        }
    }

    async verifyRegister({ email, otpCode }: VerifyRegisterRequestDTO) {
        const user = await this.usersService.getUser({ email });
        if (!user) {
            throw new RpcException(new UnauthorizedException());
        }
        if (user.emailVerified) {
            throw new RpcException(new ConflictException('User has already been verified'));
        }
        const isValid = this.verifyOtp(otpCode, {
            otpCode: user.otp.otpCode,
            otpExpires: user.otp.otpExpires,
        });
        if (!isValid) {
            throw new RpcException(new UnauthorizedException());
        }

        await this.usersService.findOneAndUpdateUser(user, {
            emailVerified: true,
            otp: { otpCode: '', otpExpires: 0 },
        });

        return {
            message: 'Verify registration successful',
        };
    }

    async resendVerifyRegister({ email }: ResendVerifyRegisterRequestDTO) {
        const userFound = await this.usersService.getUser({ email });
        if (!userFound) {
            throw new RpcException(new UnauthorizedException());
        }
        if (userFound.emailVerified) {
            throw new RpcException(new ConflictException('User has already been verified'));
        }
        const otpExpiresMinute = Number(process.env.OTP_EXPIRE_TIME) || 15;
        const expiresTime = userFound.otp.otpExpires;
        const currentTime = Date.now();
        const diffTime = Math.abs(expiresTime - currentTime);
        const minutesDifference = Math.ceil(diffTime / (1000 * 60));
        const emailContext: ConfirmEmailRegisterDTO = {
            firstName: userFound.firstName,
            lastName: userFound.lastName,
            verifyCode: userFound.otp.otpCode,
            expMinutes: otpExpiresMinute,
        };

        if (minutesDifference < 5) {
            const newOtp = this.createOtp({
                expMinutes: otpExpiresMinute,
                oldOtp: userFound.otp.otpCode,
            });
            const userUpdated = await this.usersService.findOneAndUpdateUser(userFound, {
                otp: newOtp,
            });
            Object.assign(emailContext, {
                verifyCode: userUpdated.otp.otpCode,
            });
        }

        return this.mailService
            .send(
                { cmd: 'mail_send_confirm' },
                { email: userFound.email, emailContext: emailContext },
            )
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    async getNewToken({ refreshToken }: NewTokenRequestDTO): Promise<UserDataResponseDTO> {
        try {
            if (!NewTokenRequestDTO) {
                throw new RpcException(new ForbiddenException());
            }

            const { user } = await this.verifyRefreshToken(refreshToken);
            const userFound = await this.usersService.getUser({ email: user.email });

            const { _id, email: emailUser, role } = userFound;
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                await this.signTokens({
                    _id,
                    email: emailUser,
                    role,
                });
            const userReturn = Object.assign(user, { newAccessToken, newRefreshToken });
            return userReturn;
        } catch (error) {
            throw new RpcException(new ForbiddenException());
        }
    }

    // Utils below
    createOtp({ expMinutes, oldOtp }: { expMinutes: number; oldOtp?: string | undefined }) {
        // Generate a one-time opt code
        let otpCode;
        const otpLength = 6;
        do {
            otpCode = Math.random()
                .toString(36)
                .substring(2, 2 + otpLength);
        } while (oldOtp === otpCode);

        // Set an expiration time for the opt code
        const otpExpires = Date.now() + 1000 * 60 * expMinutes; // expMinutes from now

        return {
            otpCode,
            otpExpires,
        };
    }

    verifyOtp(otpInput: string, otp: OptDTO) {
        if (!otp || !otp.otpCode || !otp.otpExpires) {
            return false;
        }
        const { otpCode, otpExpires } = otp;
        const currentTime = Date.now();
        const isValid = otpCode === otpInput && otpExpires > currentTime;

        return isValid;
    }

    async validateUser(email: string, password: string): Promise<User> {
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
            throw new RpcException(new UnauthorizedException());
        }

        try {
            const { user, exp } = await this.jwtService.verifyAsync(accessToken, {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            });
            return { user, exp };
        } catch (error) {
            throw new RpcException(new UnauthorizedException());
        }
    }

    async verifyRefreshToken(refreshToken: string) {
        if (!refreshToken) {
            throw new RpcException(new UnauthorizedException());
        }

        try {
            const { user, exp } = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            });
            return { user, exp };
        } catch (error) {
            throw new RpcException(new UnauthorizedException());
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
