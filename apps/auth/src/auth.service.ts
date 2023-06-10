import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import { LoginRequest } from './users/dtos';
import { JwtPayloadDto } from './dtos';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private configService: ConfigService,
    ) {}

    getPing() {
        return { message: 'pong', services: 'auth' };
    }

    login({ email, password }: LoginRequest) {
        return { email, password };
    }

    async getTokens({ _id, email, role }: JwtPayloadDto) {
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

        const [accessTokenExp, refreshTokenExp] = await Promise.all([
            this.jwtService.decode(accessToken),
            this.jwtService.decode(refreshToken),
        ]);

        return {
            accessToken: {
                token: accessToken,
                expTime: accessTokenExp,
            },
            refreshToken: {
                token: refreshToken,
                expTime: refreshToken,
            },
        };
    }
}
