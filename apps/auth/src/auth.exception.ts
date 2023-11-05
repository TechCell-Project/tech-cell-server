import { HttpException, HttpStatus } from '@nestjs/common';

class AuthException extends HttpException {
    constructor(errorCode: string, message: string, statusCode: HttpStatus) {
        super(
            {
                errorCode,
                message,
                statusCode,
            },
            statusCode,
        );
    }
}

export const AuthExceptions = {
    emailOrUsernameInvalid: new AuthException(
        'AUTH_EMAIL_OR_USERNAME_INVALID',
        'Email or username invalid.',
        HttpStatus.BAD_REQUEST,
    ),
    emailOrUsernameIncorrect: new AuthException(
        'AUTH_EMAIL_OR_USERNAME_INCORRECT',
        'Email or username incorrect.',
        HttpStatus.UNAUTHORIZED,
    ),
    accountIncorrect: new AuthException(
        'AUTH_ACCOUNT_INCORRECT',
        'Account incorrect.',
        HttpStatus.UNAUTHORIZED,
    ),
    accountIsBlocked: new AuthException(
        'AUTH_ACCOUNT_IS_BLOCKED',
        'Your account has been locked, please contact the administrator',
        HttpStatus.FORBIDDEN,
    ),
    emailIsNotVerified: new AuthException(
        'AUTH_EMAIL_IS_NOT_VERIFIED',
        'Your email is not verified, please verify your email first.',
        HttpStatus.UNPROCESSABLE_ENTITY,
    ),
    emailIsAlreadyVerified: new AuthException(
        'AUTH_EMAIL_IS_ALREADY_VERIFIED',
        'Your email is already verified.',
        HttpStatus.UNPROCESSABLE_ENTITY,
    ),
    emailVerifyFailedWrongOtp: new AuthException(
        'AUTH_EMAIL_VERIFY_FAILED_WRONG_OTP',
        'Email verify failed.',
        HttpStatus.UNPROCESSABLE_ENTITY,
    ),
    emailIsAlreadyExist: new AuthException(
        'AUTH_EMAIL_IS_ALREADY_EXIST',
        'Email is already exist.',
        HttpStatus.CONFLICT,
    ),
    userNameIsAlreadyExist: new AuthException(
        'AUTH_USERNAME_IS_ALREADY_EXIST',
        'Username is already exist.',
        HttpStatus.CONFLICT,
    ),
    passwordDoesNotMatch: new AuthException(
        'AUTH_PASSWORD_DOES_NOT_MATCH',
        'Password does not match.',
        HttpStatus.UNAUTHORIZED,
    ),
    refreshTokenIsInvalid: new AuthException(
        'AUTH_REFRESH_TOKEN_IS_INVALID',
        'Refresh token is invalid.',
        HttpStatus.BAD_REQUEST,
    ),
    refreshTokenIsMissing: new AuthException(
        'AUTH_REFRESH_TOKEN_IS_MISSING',
        'Refresh token is missing.',
        HttpStatus.BAD_REQUEST,
    ),
    refreshTokenIsRevoked: new AuthException(
        'AUTH_REFRESH_TOKEN_IS_REVOKED',
        'Refresh token is revoked.',
        HttpStatus.BAD_REQUEST,
    ),
    wrongOtpCode: new AuthException('AUTH_WRONG_OTP_CODE', 'Wrong otp.', HttpStatus.BAD_REQUEST),
    accessTokenIsMissing: new AuthException(
        'AUTH_ACCESS_TOKEN_IS_MISSING',
        'Access token is missing.',
        HttpStatus.BAD_REQUEST,
    ),
    accessTokenIsRevoked: new AuthException(
        'AUTH_ACCESS_TOKEN_IS_REVOKED',
        'Access token is revoked.',
        HttpStatus.BAD_REQUEST,
    ),
    accessTokenIsExpired: new AuthException(
        'AUTH_ACCESS_TOKEN_IS_EXPIRED',
        'Access token is expired.',
        HttpStatus.UNAUTHORIZED,
    ),
    tokenIsExpired: new AuthException(
        'AUTH_TOKEN_IS_EXPIRED',
        'Token is expired.',
        HttpStatus.UNAUTHORIZED,
    ),
    tokenIsInvalid: new AuthException(
        'AUTH_TOKEN_IS_INVALID',
        'Token is invalid.',
        HttpStatus.BAD_REQUEST,
    ),
    googleFailed: new AuthException(
        'AUTH_GOOGLE_FAILED',
        'Google auth failed.',
        HttpStatus.UNAUTHORIZED,
    ),
    googleEmailNotVerified: new AuthException(
        'AUTH_GOOGLE_EMAIL_NOT_VERIFIED',
        'Google email not verified.',
        HttpStatus.UNAUTHORIZED,
    ),
};
