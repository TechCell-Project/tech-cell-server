import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthCoreGuard } from './auth.core.guard';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/generated/i18n.generated';
import { ITokenVerifiedResponse } from '~apps/auth/interfaces/token-verified-response.interface';
import { catchError, firstValueFrom } from 'rxjs';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';

/**
 * @description Optional Auth Guard, verify jwt token from request and add user to request if login success
 */
@Injectable()
export class OptionalAuthGuard extends AuthCoreGuard {
    constructor(reflector: Reflector) {
        super(reflector, OptionalAuthGuard.name);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const i18n = I18nContext.current<I18nTranslations>();
            if (this.resolveSkipAuth(context)) {
                return true;
            }

            const { authHeader } = this.getAccessToken(context, i18n);

            const authHeaderParts = authHeader?.split(' ');
            if (authHeaderParts && authHeaderParts?.length !== 2) {
                throw new Error('UNAUTHORIZED');
            }
            const [, jwt] = authHeaderParts;

            const dataVerified: ITokenVerifiedResponse = await firstValueFrom(
                this.authService.send(AuthMessagePattern.verifyJwt, { jwt }).pipe(
                    catchError((error) => {
                        if (
                            error?.status === HttpStatus.UNAUTHORIZED ||
                            error?.statusCode === HttpStatus.UNAUTHORIZED
                        ) {
                            throw new Error('UNAUTHORIZED');
                        }
                        throw new Error();
                    }),
                ),
            );

            if (!dataVerified.role || !this._acceptRoles.includes(dataVerified.role)) {
                throw new Error();
            }

            // Check if token is expired
            if (!dataVerified.exp) {
                throw new Error();
            }
            const TOKEN_EXP_MS = dataVerified.exp * 1000;
            const isJwtValid = Date.now() < TOKEN_EXP_MS;
            if (!isJwtValid) {
                throw new Error();
            }
            this.addUserToRequest(dataVerified, context);
            this.logger.debug(
                `Auth in OptionalAuthCoreGuard for user: ${dataVerified._id} - ${dataVerified.email}`,
            );
            return isJwtValid;
        } catch (error) {
            this.logger.debug('Not auth in OptionalAuthCoreGuard');
            return true;
        }
    }
}
