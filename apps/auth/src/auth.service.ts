import { AuthUtilService } from './auth.util.service';
import { Injectable, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import {
    EmailRequestDTO,
    ForgotPasswordDTO,
    LoginRequestDTO,
    VerifyEmailRequestDTO,
    VerifyForgotPasswordDTO,
    RegisterRequestDTO,
    NewTokenRequestDTO,
    UserDataResponseDTO,
    ChangePasswordRequestDTO,
} from '~apps/auth/dtos';
import { User } from '~libs/resource/users/schemas';
import { RpcException } from '@nestjs/microservices';
import {
    ConfirmEmailRegisterDTO,
    ForgotPasswordEmailDTO,
    MailEventPattern,
} from '~apps/communications/mail';
import { OtpType } from '~libs/resource/otp';
import { IUserFacebookResponse, IUserGoogleResponse, ITokenVerifiedResponse } from './interfaces';
import { buildUniqueUserNameFromEmail, generateRandomString } from '~libs/common';
import { PASSWORD_MAX_LENGTH, USERS_CACHE_PREFIX } from '~libs/common/constants';
import { TCurrentUser } from '~libs/common/types';
import { Types } from 'mongoose';
import { LoginTicket, OAuth2Client, OAuth2ClientOptions } from 'google-auth-library';
import { cleanUserBeforeResponse } from '~libs/resource/users/utils/user.util';
import { AuthExceptions } from './auth.exception';

@Injectable()
export class AuthService extends AuthUtilService {
    protected logger = new Logger(AuthService.name);

    async login({ emailOrUsername, password }: LoginRequestDTO): Promise<UserDataResponseDTO> {
        const user = await this.validateUserLogin(emailOrUsername, password);

        if (!user) {
            throw new RpcException(AuthExceptions.emailOrUsernameIncorrect);
        }

        if (user.block && user?.block?.isBlocked) {
            throw new RpcException(AuthExceptions.accountIsBlocked);
        }

        if (!user.emailVerified) {
            throw new RpcException(AuthExceptions.emailIsNotVerified);
        }

        return await this.buildUserTokenResponse(user);
    }

    async checkEmail({ email }: EmailRequestDTO) {
        const userFound = await this.usersService.countUser({ email });

        if (userFound > 0) {
            throw new RpcException(AuthExceptions.emailIsAlreadyExist);
        }

        return {
            message: 'Email is not in use',
        };
    }

    async register({
        email,
        userName,
        firstName,
        lastName,
        password,
        re_password,
    }: RegisterRequestDTO) {
        let userFound: User;
        let userFoundByUserName: User;

        try {
            userFound = await this.usersService.getUser({
                email,
            });
        } catch (error) {
            userFound = undefined;
        }

        if (userName && userName.length > 0) {
            try {
                userFoundByUserName = await this.usersService.getUser({
                    userName,
                });
            } catch (error) {
                userFoundByUserName = undefined;
            }
        } else {
            userName = await this.createUniqueUserName(email);
        }

        if (userFound || userFound?.emailVerified) {
            throw new RpcException(AuthExceptions.emailIsAlreadyExist);
        }

        if (userFoundByUserName) {
            throw new RpcException(AuthExceptions.userNameIsAlreadyExist);
        }

        if (password !== re_password) {
            throw new RpcException(AuthExceptions.passwordDoesNotMatch);
        }

        const [userCreated] = await Promise.all([
            this.usersService.createUser({
                email,
                userName,
                firstName,
                lastName,
                password,
            }),
            this.redisService.delWithPrefix(USERS_CACHE_PREFIX),
        ]);

        const otp = await this.otpService.createOrRenewOtp({
            email: userCreated.email,
            otpType: OtpType.VerifyEmail,
        });
        const emailContext: ConfirmEmailRegisterDTO = {
            otpCode: otp.otpCode,
        };
        this.communicationsService.emit(MailEventPattern.sendMailConfirm, {
            email: userCreated.email,
            emailContext,
        });

        return {
            message: 'Register successfully, please check your email to verify it',
        };
    }

    async verifyEmail({ email, otpCode }: VerifyEmailRequestDTO) {
        const userFound = await this.usersService.getUser({ email });

        if (userFound.emailVerified) {
            throw new RpcException(AuthExceptions.emailIsAlreadyVerified);
        }

        const isVerified = await this.otpService.verifyOtp({
            email,
            otpCode,
            otpType: OtpType.VerifyEmail,
        });

        if (!isVerified) {
            throw new RpcException(AuthExceptions.emailVerifyFailedWrongOtp);
        }

        await this.usersService.findOneAndUpdateUser({ email }, { emailVerified: isVerified });

        return {
            message: 'Email is verified, update your information now',
        };
    }

    async resendVerifyEmailOtp({ email }: EmailRequestDTO) {
        const user = await this.usersService.getUser({ email });
        if (user.emailVerified) {
            throw new RpcException(AuthExceptions.emailIsAlreadyVerified);
        }

        const otp = await this.otpService.createOrRenewOtp({
            email: user.email,
            otpType: OtpType.VerifyEmail,
        });
        const emailContext = new ConfirmEmailRegisterDTO({
            otpCode: otp.otpCode,
        });

        await this.limitEmailSent(user.email);
        this.communicationsService.emit(MailEventPattern.sendMailConfirm, {
            email: user.email,
            emailContext,
        });

        return {
            message: 'An email has already been sent to you email address, please check your email',
        };
    }

    async getNewToken({
        refreshToken: oldRefreshToken,
    }: NewTokenRequestDTO): Promise<UserDataResponseDTO> {
        try {
            if (!oldRefreshToken) {
                throw new RpcException(AuthExceptions.refreshTokenIsInvalid);
            }

            const { email } = await this.verifyRefreshToken(oldRefreshToken);
            const userFound = await this.usersService.getUser({ email });

            const { _id, email: emailUser, role } = userFound;
            const { accessToken, refreshToken } = await this.signTokens({
                _id,
                email: emailUser,
                role,
            });

            await this.revokeRefreshToken(oldRefreshToken);

            return { ...cleanUserBeforeResponse(userFound), accessToken, refreshToken };
        } catch (error) {
            throw new RpcException(new ForbiddenException(error.message));
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

        this.communicationsService.emit(MailEventPattern.sendMailForgotPassword, {
            ...emailContext,
        });

        return {
            message: 'An email has already been sent to you email address, please check your email',
        };
    }

    async changePassword({
        changePwData,
        user,
    }: {
        changePwData: ChangePasswordRequestDTO;
        user: TCurrentUser;
    }) {
        const { oldPassword, newPassword, reNewPassword } = new ChangePasswordRequestDTO(
            changePwData,
        );

        if (newPassword !== reNewPassword) {
            throw new RpcException(AuthExceptions.passwordDoesNotMatch);
        }

        const userFound = await this.usersService.getUser({ _id: new Types.ObjectId(user._id) });
        const validateLogin = await this.validateUserLogin(userFound.email, oldPassword);
        if (!validateLogin) {
            throw new RpcException(AuthExceptions.accountIncorrect);
        }

        const userUpdated = await this.usersService.changeUserPassword({
            email: validateLogin.email,
            password: newPassword,
        });

        if (!userUpdated) {
            throw new RpcException(
                new BadRequestException('Something went wrong, please try again'),
            );
        }

        return {
            message: 'Password changed successfully',
        };
    }

    async verifyForgotPassword({ email, otpCode, password, re_password }: VerifyForgotPasswordDTO) {
        await this.usersService.getUser({ email });

        if (password !== re_password) {
            throw new RpcException(AuthExceptions.passwordDoesNotMatch);
        }

        const isVerified = await this.otpService.verifyOtp({
            email,
            otpCode,
            otpType: OtpType.ForgotPassword,
        });
        if (!isVerified) {
            throw new RpcException(AuthExceptions.wrongOtpCode);
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

    async verifyAccessToken(accessToken: string): Promise<ITokenVerifiedResponse> {
        if (!accessToken) {
            throw new RpcException(AuthExceptions.accessTokenIsMissing);
        }

        if (await this.isAccessTokenRevoked(accessToken)) {
            throw new RpcException(AuthExceptions.accessTokenIsRevoked);
        }

        const dataVerified = (await this.verifyToken(
            accessToken,
            this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        )) as ITokenVerifiedResponse;

        if (await this.checkIsRequiredRefresh(dataVerified._id)) {
            throw new RpcException(AuthExceptions.accessTokenIsExpired);
        }

        return dataVerified;
    }

    async verifyRefreshToken(refreshToken: string): Promise<ITokenVerifiedResponse> {
        if (!refreshToken) {
            throw new RpcException(AuthExceptions.refreshTokenIsMissing);
        }

        if (await this.isRefreshTokenRevoked(refreshToken)) {
            throw new RpcException(AuthExceptions.refreshTokenIsRevoked);
        }

        return (await this.verifyToken(
            refreshToken,
            this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        )) as ITokenVerifiedResponse;
    }

    async google(idToken: string) {
        const options: OAuth2ClientOptions = {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        };
        const client = new OAuth2Client(options);

        let ticket: LoginTicket;
        try {
            ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (error) {
            this.logger.error(error.message);
            throw new RpcException(AuthExceptions.googleFailed);
        }
        const user = ticket.getPayload();

        if (user.email_verified !== true) {
            throw new RpcException(AuthExceptions.googleEmailNotVerified);
        }

        try {
            const userFound = await this.usersService.getUser({ email: user.email });
            return this.buildUserTokenResponse(userFound);
        } catch (error) {
            // If user not found, create a new user
            const newUser = await this.usersService.createUser({
                email: user.email,
                emailVerified: user.email_verified,
                userName: buildUniqueUserNameFromEmail(user.email),
                firstName: user.family_name,
                lastName: user.given_name,
                password: `${user.at_hash}${generateRandomString(
                    PASSWORD_MAX_LENGTH - user.at_hash.length,
                )}`,
            });
            return this.buildUserTokenResponse(newUser);
        }
    }

    async googleLogin({ user }: { user: IUserGoogleResponse }) {
        if (!user) {
            throw new RpcException(AuthExceptions.googleFailed);
        }

        let userFound: User | undefined;
        try {
            userFound = await this.usersService.getUser({ email: user.email });
        } catch (error) {
            // If user not found, create a new user
            const newUser = await this.usersService.createUser({
                email: user.email,
                userName: buildUniqueUserNameFromEmail(user.email),
                firstName: user.firstName,
                lastName: user.lastName,
                password: `${user.openid}${generateRandomString(
                    PASSWORD_MAX_LENGTH - user.openid.length,
                )}`,
            });
            return this.buildUserTokenResponse(newUser);
        }

        if (!userFound) {
            throw new RpcException(AuthExceptions.googleFailed);
        }

        return this.buildUserTokenResponse(userFound);
    }

    async facebookLogin({ user }: { user: IUserFacebookResponse }) {
        if (!user) {
            throw new RpcException(new BadRequestException('Login with Facebook failed'));
        }

        let userFound: User | undefined = undefined;
        let newUser: User | undefined = undefined;
        try {
            // will throw exception if not found
            userFound = await this.usersService.getUser({ email: user.email });
        } catch (error) {
            // if not found, create new user
            newUser = await this.usersService.createUser({
                email: user.email,
                userName: buildUniqueUserNameFromEmail(user.email),
                firstName: user.firstName,
                lastName: user.lastName,
                password: `${user.email}${generateRandomString(
                    PASSWORD_MAX_LENGTH - user.email.length,
                )}`,
            });
        }

        if (!userFound && !newUser) {
            throw new RpcException(new BadRequestException('Login with Facebook failed'));
        }

        if (userFound) {
            return this.buildUserTokenResponse(userFound);
        }

        if (newUser) {
            return this.buildUserTokenResponse(newUser);
        }
    }
}
