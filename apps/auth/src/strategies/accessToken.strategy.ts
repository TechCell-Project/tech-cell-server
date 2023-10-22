import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayloadDto, JwtRequestDto } from '~apps/auth/dtos';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: JwtRequestDto) => {
                    return request?.jwt;
                },
            ]),
            secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
            },
        });
    }

    validate(payload: JwtPayloadDto) {
        return { ...payload };
    }
}
