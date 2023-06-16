import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    UnprocessableEntityException,
    Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDTO } from '~/apps/auth/dtos';
import {
    JwtPayloadDto,
    RegisterRequestDTO,
    NewTokenRequestDTO,
    UserDataResponseDTO,
} from '~/apps/auth/dtos';
import * as bcrypt from 'bcrypt';
import { User } from './users/schemas';
import { RpcException, ClientRMQ } from '@nestjs/microservices';
import { MAIL_SERVICE } from '~/constants';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private configService: ConfigService,
        @Inject(MAIL_SERVICE) private mailService: ClientRMQ,
    ) {}

    getPing() {
        return { message: 'pong', services: 'auth' };
    }

    async register(userRegister: RegisterRequestDTO) {
        const { email, password, re_password } = userRegister;

        if (password !== re_password) {
            throw new RpcException(new UnprocessableEntityException('Passwords do not match'));
        }

        const userCreated = await this.usersService.createUser({ email, password });

        if (!userCreated) {
            throw new RpcException(
                new UnprocessableEntityException('Error occurred when creating user'),
            );
        }

        // return {
        //     message:
        //         'Your registration was successfully, please check your email to verify your registration',
        // };

        const res = this.mailService
            .send({ cmd: 'mail_send_confirm' }, { email: userCreated.email, message: 'Heloooo' })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
        return res;
    }

    async login({ email, password }: LoginRequestDTO): Promise<UserDataResponseDTO> {
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

            const userReturn: UserDataResponseDTO = Object.assign(user, {
                accessToken,
                refreshToken,
            });

            return userReturn;
        } catch (error) {
            throw new RpcException(new UnauthorizedException());
        }
    }

    async getNewToken({ refreshToken }: NewTokenRequestDTO): Promise<UserDataResponseDTO> {
        try {
            if (!NewTokenRequestDTO) {
                throw new RpcException(new ForbiddenException());
            }

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
            return userReturn;
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
