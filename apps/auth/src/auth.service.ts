import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDTO } from './dtos';
import { JwtPayloadDto, RegisterRequestDTO, NewTokenRequestDTO } from './dtos';
import * as bcrypt from 'bcrypt';
import { User } from './users/schemas';
import { RpcException } from '@nestjs/microservices';

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

    async register(userRegister: RegisterRequestDTO) {
        const { email, password } = userRegister;
        const userCreated = await this.usersService.createUser({ email, password });
        delete userCreated.password;
        return userCreated;
    }

    async login({ email, password }: LoginRequestDTO) {
        try {
            const user = await this.validateUser(email, password);

            if (!user) {
                throw new RpcException(new UnauthorizedException());
            }
            delete user.password;

            const { _id, email: emailUser, role } = user;
            const { accessToken, refreshToken } = await this.signTokens({
                _id,
                email: emailUser,
                role,
            });

            const userReturn = Object.assign(user, { accessToken, refreshToken });

            return { user: userReturn };
        } catch (error) {
            throw new RpcException(new UnauthorizedException());
        }
    }

    async getNewToken({ refreshToken }: NewTokenRequestDTO) {
        try {
            const { user } = await this.verifyRefreshToken(refreshToken);
            const userFound = await this.usersService.getUser({ email: user.email });

            const { _id, email: emailUser, role } = userFound;
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                await this.signTokens({
                    _id,
                    email: emailUser,
                    role,
                });
            const userReturn = Object.assign(user, { newAccessToken, newRefreshToken });
            return { user: userReturn };
        } catch (error) {
            throw new RpcException(new ForbiddenException());
        }
    }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.getUser({ email });

        const doesUserExist = !!user;

        if (!doesUserExist) return null;

        const doesPasswordMatch = await this.doesPasswordMatch(password, user.password);

        if (!doesPasswordMatch) return null;

        return user;
    }

    async doesPasswordMatch(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    async verifyAccessToken(accessToken: string) {
        if (!accessToken) {
            throw new RpcException(new UnauthorizedException());
        }

        try {
            const { user, exp } = await this.jwtService.verifyAsync(accessToken, {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            });
            return { user, exp };
        } catch (error) {
            throw new RpcException(new UnauthorizedException());
        }
    }

    async verifyRefreshToken(refreshToken: string) {
        if (!refreshToken) {
            throw new RpcException(new UnauthorizedException());
        }

        try {
            const { user, exp } = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            });
            return { user, exp };
        } catch (error) {
            throw new RpcException(new UnauthorizedException());
        }
    }

    async signTokens({ _id, email, role }: JwtPayloadDto) {
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

        return {
            accessToken,
            refreshToken,
        };
    }
}
