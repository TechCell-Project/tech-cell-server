import { TestBed } from '@automock/jest';
import { ClientRMQ } from '@nestjs/microservices';
import { AuthController } from '../controllers/auth.controller';
import { AUTH_SERVICE } from '~libs/common/constants';
import { of } from 'rxjs';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';
import {
    LoginRequestDTO,
    RegisterRequestDTO,
    EmailRequestDTO,
    VerifyEmailRequestDTO,
    NewTokenRequestDTO,
    ForgotPasswordDTO,
    VerifyForgotPasswordDTO,
    ChangePasswordRequestDTO,
    GoogleLoginRequestDTO,
} from '~apps/auth/dtos';
import { TCurrentUser } from '~libs/common/types';

describe(AuthController, () => {
    let authController: AuthController;
    let authService: jest.Mocked<ClientRMQ>;
    let mockCurrentUser: TCurrentUser;

    beforeAll(async () => {
        const { unit, unitRef } = TestBed.create(AuthController)
            .mock<ClientRMQ>(AUTH_SERVICE)
            .using({
                send: jest.fn().mockImplementation(() => ({
                    pipe: jest.fn().mockImplementation(() => of({})),
                })),
            })
            .compile();

        authController = unit;
        authService = unitRef.get<ClientRMQ>(AUTH_SERVICE);
        mockCurrentUser = {
            _id: '60f0c9b9e6b3f3b3e8c9b0a1',
        };
    });

    afterAll(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    test('should be defined', () => {
        expect(authController).toBeDefined();
        expect(authService).toBeDefined();
        expect(mockCurrentUser).toBeDefined();
    });

    describe('login', () => {
        const message = AuthMessagePattern.login;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: LoginRequestDTO = {
                emailOrUsername: 'username',
                password: 'password',
            };
            await authController.login(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('check-email', () => {
        const message = AuthMessagePattern.checkEmail;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: EmailRequestDTO = {
                email: 'email@gmail.com',
            };
            await authController.checkEmail(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('register', () => {
        const message = AuthMessagePattern.register;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: RegisterRequestDTO = {
                email: 'email@gmail.com',
                firstName: 'firstName',
                lastName: 'lastName',
                password: 'password',
                re_password: 'password',
                userName: 'username',
            };
            await authController.register(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('verify-email', () => {
        const message = AuthMessagePattern.verifyEmail;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: VerifyEmailRequestDTO = {
                email: 'email@gmail.com',
                otpCode: '123456',
            };
            await authController.verifyEmail(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('resend-verify-email-otp', () => {
        const message = AuthMessagePattern.resendVerifyEmailOtp;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: EmailRequestDTO = {
                email: 'email@gmail.com',
            };
            await authController.resendVerifyEmailOtp(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('refresh-token', () => {
        const message = AuthMessagePattern.getNewToken;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: NewTokenRequestDTO = {
                refreshToken: 'refreshToken',
            };
            await authController.getNewToken(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('forgot-password', () => {
        const message = AuthMessagePattern.forgotPassword;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: ForgotPasswordDTO = {
                email: '',
            };
            await authController.forgotPassword(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('verify-forgot-password', () => {
        const message = AuthMessagePattern.verifyForgotPassword;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: VerifyForgotPasswordDTO = {
                email: 'email@gmail.com',
                otpCode: '123456',
                password: 'password',
                re_password: 'password',
            };
            await authController.verifyForgotPassword(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });

    describe('change-password', () => {
        const message = AuthMessagePattern.changePassword;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const changePwData: ChangePasswordRequestDTO = {
                oldPassword: 'oldPassword',
                newPassword: 'newPassword',
                reNewPassword: 'newPassword',
            };
            await authController.changePassword(changePwData, mockCurrentUser);
            expect(authService.send).toBeCalledWith(message, {
                changePwData,
                user: mockCurrentUser,
            });
        });
    });

    describe('google', () => {
        const message = AuthMessagePattern.google;
        test(`should called authService.send with ${JSON.stringify(message)}`, async () => {
            const data: GoogleLoginRequestDTO = {
                idToken: 'tokenId',
            };
            await authController.google(data);
            expect(authService.send).toBeCalledWith(message, data);
        });
    });
});
