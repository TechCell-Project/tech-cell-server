import { Test, TestingModule } from '@nestjs/testing';
import * as otpGenerator from 'otp-generator';
import * as bcrypt from 'bcrypt';
import { OtpRepository } from '../otp.repository';
import { CreateOtpDTO, VerifyOtpDTO } from '../dtos';
import { Otp } from '../otp.schema';
import { OtpService } from '../otp.service';
import { Types } from 'mongoose';
import { OtpType } from '../otp.enum';

describe('OtpService', () => {
    let service: OtpService;
    let otpRepository: OtpRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OtpService,
                {
                    provide: OtpRepository,
                    useValue: {
                        createOtp: jest.fn(),
                        renewOtp: jest.fn(),
                        findOne: jest.fn(),
                        removeOtp: jest.fn(),
                        count: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OtpService>(OtpService);
        otpRepository = module.get<OtpRepository>(OtpRepository);
    });

    describe('generateOtp', () => {
        it('should return otpCode and hashedOtp', async () => {
            const bcryptSalt = await bcrypt.genSalt(10);
            const otpCode = '123456';
            const hashedOtp = 'hashed-otp';
            jest.spyOn(bcrypt, 'genSalt').mockImplementationOnce(() => Promise.resolve(bcryptSalt));
            jest.spyOn(otpGenerator, 'generate').mockImplementationOnce(() => otpCode);
            jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.resolve(hashedOtp));

            const result = await service.generateOtp();

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(otpGenerator.generate).toHaveBeenCalledWith(6, {
                digits: true,
                specialChars: false,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(otpCode, bcryptSalt);
            expect(result).toEqual({
                otpCode,
                hashedOtp,
            });
        });

        // it('should throw internal server error on failed to hash otpCode', async () => {
        //     const bcryptSalt = await bcrypt.genSalt(10);
        //     const otpCode = '123456';
        //     jest.spyOn(bcrypt, 'genSalt').mockImplementationOnce(() => Promise.resolve(bcryptSalt));
        //     jest.spyOn(otpGenerator, 'generate').mockImplementationOnce(() => otpCode);
        //     jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() =>
        //         Promise.reject(new Error('Failed to hash OTP code')),
        //     );

        //     await expect(service.generateOtp()).rejects.toThrow(
        //         new RpcException(new InternalServerErrorException('Failed to hash OTP code')),
        //     );

        //     expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        //     expect(otpGenerator.generate).toHaveBeenCalledWith(6, {
        //         digits: true,
        //         specialChars: false,
        //         lowerCaseAlphabets: false,
        //         upperCaseAlphabets: false,
        //     });
        //     expect(bcrypt.hash).toHaveBeenCalledWith(otpCode, bcryptSalt);
        // });
    });

    describe('createOrRenewOtp', () => {
        const createOtpDto: CreateOtpDTO = {
            email: 'test@test.com',
            otpType: OtpType.VerifyEmail,
        };

        it('should create and return otp when email not found in otpRepository', async () => {
            jest.spyOn(service, 'generateOtp').mockImplementationOnce(() =>
                Promise.resolve({
                    otpCode: '123456',
                    hashedOtp: 'hashed-otp',
                }),
            );
            jest.spyOn(otpRepository, 'count').mockImplementationOnce(() => Promise.resolve(0));
            const createdOtp: Otp = {
                _id: new Types.ObjectId('test-id-1234'),
                email: createOtpDto.email,
                otpType: createOtpDto.otpType,
                otpCode: '123456-hash',
                createdAt: new Date('2021-01-01T00:00:00.000Z'),
                updatedAt: new Date('2021-01-01T00:00:00.000Z'),
            };
            jest.spyOn(otpRepository, 'createOtp').mockImplementationOnce(() =>
                Promise.resolve(createdOtp),
            );

            const result = await service.createOrRenewOtp(createOtpDto);

            expect(service.generateOtp).toHaveBeenCalled();
            expect(otpRepository.count).toHaveBeenCalledWith({
                email: createOtpDto.email,
                otpType: createOtpDto.otpType,
            });
            expect(otpRepository.createOtp).toHaveBeenCalledWith({
                email: createOtpDto.email,
                hashedOtp: 'hashed-otp',
                otpType: createOtpDto.otpType,
            });
            expect(result).toEqual({
                ...createdOtp,
                otpCode: '123456', // should return plain otpCode
            });
        });

        describe('createOrRenewOtp', () => {
            const createOtpDto: CreateOtpDTO = {
                email: 'test@test.com',
                otpType: OtpType.VerifyEmail,
            };

            it('should create and return otp when email not found in otpRepository', async () => {
                jest.spyOn(service, 'generateOtp').mockImplementationOnce(() =>
                    Promise.resolve({
                        otpCode: '123456',
                        hashedOtp: 'hashed-otp',
                    }),
                );
                jest.spyOn(otpRepository, 'count').mockImplementationOnce(() => Promise.resolve(0));
                const createdOtp = {
                    _id: new Types.ObjectId('test-id-1234'),
                    email: createOtpDto.email,
                    otpType: createOtpDto.otpType,
                    otpCode: '123456-hash',
                    createdAt: new Date('2021-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
                };
                jest.spyOn(otpRepository, 'createOtp').mockImplementationOnce(() =>
                    Promise.resolve(createdOtp),
                );

                const result = await service.createOrRenewOtp(createOtpDto);

                expect(service.generateOtp).toHaveBeenCalled();
                expect(otpRepository.count).toHaveBeenCalledWith({
                    email: createOtpDto.email,
                    otpType: createOtpDto.otpType,
                });
                expect(otpRepository.createOtp).toHaveBeenCalledWith({
                    email: createOtpDto.email,
                    hashedOtp: 'hashed-otp',
                    otpType: createOtpDto.otpType,
                });
                expect(result).toEqual({
                    ...createdOtp,
                    otpCode: '123456', // should return plain otpCode
                });
            });
        });
    });

    describe('verifyOtp', () => {
        const verifyOtpDto: VerifyOtpDTO = {
            email: 'test@test.com',
            otpCode: '123456',
            otpType: OtpType.VerifyEmail,
        };

        it('should return true when otp is valid', async () => {
            const mockOtp: Otp = {
                _id: new Types.ObjectId('test-id-1234'),
                email: verifyOtpDto.email,
                otpType: verifyOtpDto.otpType,
                otpCode: '$2b$10$t7KcWXeZWkHXjyk77xHmpugbu/KWPeq5iHz41ycoN65lhRoVkqLXm',
                createdAt: new Date('2021-01-01T00:00:00.000Z'),
                updatedAt: new Date('2021-01-01T00:00:00.000Z'),
            };
            jest.spyOn(otpRepository, 'findOne').mockImplementationOnce(() =>
                Promise.resolve(mockOtp),
            );
            jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true));
            jest.spyOn(otpRepository, 'removeOtp').mockImplementationOnce(() =>
                Promise.resolve(undefined),
            );

            const result = await service.verifyOtp(verifyOtpDto);

            expect(otpRepository.findOne).toHaveBeenCalledWith({
                email: verifyOtpDto.email,
                otpType: verifyOtpDto.otpType,
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(verifyOtpDto.otpCode, mockOtp.otpCode);
            expect(otpRepository.removeOtp).toHaveBeenCalledWith({
                email: verifyOtpDto.email,
                otpType: verifyOtpDto.otpType,
            });
            expect(result).toBe(true);
        });

        it('should return false when otp is not valid', async () => {
            const mockOtp: Otp = {
                _id: new Types.ObjectId('test-id-1234'),
                email: verifyOtpDto.email,
                otpType: verifyOtpDto.otpType,
                otpCode: '$2b$10$t7KcWXeZWkHXjyk77xHmpugbu/KWPeq5iHz41ycoN65lhRoVkqLXm',
                createdAt: new Date('2021-01-01T00:00:00.000Z'),
                updatedAt: new Date('2021-01-01T00:00:00.000Z'),
            };
            jest.spyOn(otpRepository, 'findOne').mockImplementationOnce(() =>
                Promise.resolve(mockOtp),
            );
            jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(false));
            jest.spyOn(otpRepository, 'removeOtp').mockImplementationOnce(() =>
                Promise.resolve(undefined),
            );

            const result = await service.verifyOtp(verifyOtpDto);

            expect(otpRepository.findOne).toHaveBeenCalledWith({
                email: verifyOtpDto.email,
                otpType: verifyOtpDto.otpType,
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(verifyOtpDto.otpCode, mockOtp.otpCode);
            expect(otpRepository.removeOtp).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });
});
