import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { ProductsMntUtilService } from './products-mnt.ultil.service';

@Injectable()
export class ProductsMntService extends ProductsMntUtilService {
    // async getAll() {

    // }
}
