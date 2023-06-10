import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dtos';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: () => {
                return {};
            },
            secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
            signOptions: {
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
            },
        });
    }

    validate(payload: JwtPayloadDto) {
        return payload;
    }
}
