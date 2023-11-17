import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '~libs/resource/abstract';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Attribute } from './schemas';

@Injectable()
export class AttributesRepository extends AbstractRepository<Attribute> {
    protected readonly logger = new Logger(AttributesRepository.name);
    constructor(
        @InjectModel(Attribute.name) attributeModel: Model<Attribute>,
        @InjectConnection() connection: Connection,
    ) {
        super(attributeModel, connection);
    }
}
