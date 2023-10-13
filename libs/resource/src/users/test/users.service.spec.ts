/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { CreateUserDTO } from '../dtos';
import { User } from '../schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import {
    ConflictException,
    LoggerService,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

const mockUsersRepository = () => ({
    create: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
});

describe('UsersService', () => {
    let usersService: UsersService;
    let usersRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: UsersRepository, useFactory: mockUsersRepository },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        usersRepository = module.get<UsersRepository>(UsersRepository);
    });

    describe('createUser', () => {
        let createUserDto: CreateUserDTO;
        let user: User;

        beforeEach(() => {
            createUserDto = {
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                password: 'password123',
            };

            user = {
                _id: new Types.ObjectId('user-id-1234'),
                ...createUserDto,
                password: 'hashed_password',
            };
        });

        it('should create a new user if the request is valid', async () => {
            usersRepository.count.mockResolvedValue(0);
            usersRepository.create.mockResolvedValue(user);
            usersService.hashPassword = jest.fn().mockResolvedValue('hashed_password');

            const result = await usersService.createUser(createUserDto);

            expect(usersRepository.count).toHaveBeenCalledWith({ email: createUserDto.email });
            expect(usersRepository.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: 'hashed_password',
            });
            expect(result).toEqual(user);
        });

        it('should throw an UnprocessableEntityException if email already exists', async () => {
            usersRepository.count.mockResolvedValue(1);

            expect(usersService.createUser(createUserDto)).rejects.toThrow('Email already exists.');
            expect(usersRepository.count).toHaveBeenCalled();
        });
    });

    describe('validateUser', () => {
        let email: string;
        let password: string;
        let user: User;

        beforeEach(() => {
            email = 'test@example.com';
            password = 'password123';

            user = {
                _id: new Types.ObjectId('user-id-1234'),
                email,
                firstName: 'Test',
                lastName: 'User',
                password: 'hashed_password',
            };

            jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
        });

        it('should return the user if the credentials are valid', async () => {
            usersRepository.findOne = jest.fn().mockResolvedValue(user);

            const result = await usersService.isCredentialsCorrect(email, password);

            expect(usersRepository.findOne).toHaveBeenCalledWith({ email });
            expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
            expect(result).toEqual(user);
        });

        it('should throw an error with incorrect credentials', async () => {
            // Arrange
            usersRepository.findOne = jest
                .fn()
                .mockRejectedValueOnce(new RpcException('Credentials are not valid.'));

            // Act
            try {
                await usersService.isCredentialsCorrect(email, password);
            } catch (error) {
                // Assert
                expect(error).toBeInstanceOf(RpcException);
                expect(error.message).toEqual(
                    new UnauthorizedException('Credentials are not valid.').message,
                );
                expect(usersRepository.findOne).toHaveBeenCalledWith({ email });
            }
        });
    });
});
