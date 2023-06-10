import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtRequestDto } from '../dtos';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: JwtRequestDto) => {
                    console.log(request);
                    return request?.jwt;
                },
            ]),
            passReqToCallback: true,
            secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
            },
        });
    }

    validate(req: Request, payload: any) {
        const refreshToken = req.get('AuthorizationRefresh').replace('Bearer', '').trim();
        return { ...payload, refreshToken };
    }
}
