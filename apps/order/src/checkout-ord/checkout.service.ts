import { TCurrentUser } from '@app/common/types';
import { UsersService } from '@app/resource/users';
import { GhnService } from '@app/third-party/giaohangnhanh';
import { GhtkService } from '@app/third-party/giaohangtietkiem.vn';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';

@Injectable()
export class CheckoutService {
    constructor(
        private readonly ghtkService: GhtkService,
        private readonly ghnService: GhnService,
        private readonly userService: UsersService,
    ) {}

    async calculateShippingFee({ user }: { user: TCurrentUser }) {
        const userAddress = (
            await this.userService.getUser({
                _id: new Types.ObjectId(user._id),
            })
        ).address[0];
        if (!userAddress) {
            throw new RpcException(new BadRequestException('User has no address'));
        }
        const provincesData = await this.ghnService.calculateShippingFee(userAddress);
        return provincesData;
    }
}
