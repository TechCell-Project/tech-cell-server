import { AuthServiceUtil } from './auth.service.util';
import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
    NotAcceptableException,
    UnprocessableEntityException,
} from '@nestjs/common';
import {
    CheckEmailRequestDTO,
    ForgotPasswordDTO,
    LoginRequestDTO,
    VerifyEmailRequestDTO,
    VerifyForgotPasswordDTO,
} from '~/apps/auth/dtos';
import { RegisterRequestDTO, NewTokenRequestDTO, UserDataResponseDTO } from '~/apps/auth/dtos';
import { User } from './users/schemas';
import { RpcException } from '@nestjs/microservices';
import { catchError, throwError, firstValueFrom } from 'rxjs';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from '~/apps/mail/dtos';
import { OtpType } from '~/apps/auth/otp';

@Injectable()
export class AuthService extends AuthServiceUtil {
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

    async forgotPassword({ email }: ForgotPasswordDTO) {
        // If not found, auto throw the exception
        const userFound = await this.usersService.getUser({ email });

        const otp = await this.otpService.createOrRenewOtp({
            email,
            otpType: OtpType.ForgotPassword,
        });

        const emailContext: ForgotPasswordEmailDTO = {
            userEmail: userFound.email,
            otpCode: otp.otpCode,
            firstName: userFound.firstName,
        };

        await firstValueFrom(
            this.mailService
                .send({ cmd: 'mail_send_forgot_password' }, { ...emailContext })
                .pipe(catchError((error) => throwError(() => new RpcException(error.response)))),
        );

        return {
            message: 'An email has already been sent to you email address, please check your email',
        };
    }

    async verifyForgotPassword({ email, otpCode, password, re_password }: VerifyForgotPasswordDTO) {
        await this.usersService.getUser({ email });

        if (password !== re_password) {
            throw new RpcException(new BadRequestException('Password does not match'));
        }

        const isVerified = await this.otpService.verifyOtp({
            email,
            otpCode,
            otpType: OtpType.ForgotPassword,
        });
        if (!isVerified) {
            throw new RpcException(new UnprocessableEntityException('Otp code does not match'));
        }

        const userUpdated = await this.usersService.changeUserPassword({ email, password });
        if (!userUpdated) {
            throw new RpcException(
                new BadRequestException('Something went wrong, please try again'),
            );
        }

        return {
            message: 'Password changed successfully',
        };
    }

    googleLogin(user) {
        if (!user) {
            return 'No user from google';
        }

        return {
            message: 'User information from google',
            user: user,
        };
    }
}
