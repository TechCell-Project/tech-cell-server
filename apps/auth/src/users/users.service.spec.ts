import { Test } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { UnprocessableEntityException } from '@nestjs/common';

describe('UsersService', () => {
    let usersService: UsersService;
    let usersRepository: UsersRepository;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UsersRepository,
                    useValue: {
                        count: jest.fn(),
                        create: jest.fn(),
                        findOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                    },
                },
            ],
        }).compile();

        usersService = moduleRef.get<UsersService>(UsersService);
        usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user if email does not already exist', async () => {
            (usersRepository.count as jest.Mock).mockReturnValue(0);
            const newUser = { id: '123', email: 'test@example.com' };
            (usersRepository.create as jest.Mock).mockReturnValue(newUser);

            const result = await usersService.createUser({
                email: 'test@example.com',
            });

            expect(result).toEqual(newUser);
            expect(usersRepository.count).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(usersRepository.create).toHaveBeenCalledWith({
                email: 'test@example.com',
                requireUpdateInfo: true,
            });
        });

        it('should throw an UnprocessableEntityException if email already exists', async () => {
            (usersRepository.count as jest.Mock).mockReturnValue(1);

            await expect(usersService.createUser({ email: 'test@example.com' })).rejects.toThrow(
                new RpcException('Email already exists.'),
            );

            expect(usersRepository.count).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(usersRepository.create).not.toHaveBeenCalled();
        });

        it('should call the hashPassword method with the password argument', async () => {
            const hashedPassword = 'hashedPassword';
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

            await usersService.changeUserPassword('test@example.com', 'password');

            expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
        });
    });
});
