export const AuthMessagePattern = {
    login: { cmd: 'auth_login' },
    checkEmail: { cmd: 'auth_check_email' },
    register: { cmd: 'auth_register' },
    verifyEmail: { cmd: 'auth_verify_email' },
    getNewToken: { cmd: 'auth_get_new_token' },
    verifyJwt: { cmd: 'verify-jwt' },
    forgotPassword: { cmd: 'auth_forgot_password' },
    verifyForgotPassword: { cmd: 'auth_verify_forgot_password' },
    googleAuth: { cmd: 'auth_google_login' },
    google: { cmd: 'auth_id_token_google_login' },
    facebookAuth: { cmd: 'auth_facebook_login' },
    resendVerifyEmailOtp: { cmd: 'auth_resend_verify_email_otp' },
    changePassword: { cmd: 'auth_change_password' },
};

export const AuthEventPattern = {};
