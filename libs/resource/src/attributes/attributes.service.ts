import { ConflictException, Injectable } from '@nestjs/common';
import { AttributesRepository } from './attributes.repository';
import { Types } from 'mongoose';
import { CreateAttributeDTO, UpdateAttributeDTO } from './dtos';
import { IBaseQuery } from '../interfaces';
import { RpcException } from '@nestjs/microservices';
import { Attribute } from './schemas';

@Injectable()
export class AttributesService {
    constructor(private readonly attributesRepository: AttributesRepository) {}

    async getAttributes({ filterQueries, queryOptions, projectionArgs }: IBaseQuery<Attribute>) {
        return this.attributesRepository.find(filterQueries, queryOptions, projectionArgs);
    }

    async getAttributeById(id: string | Types.ObjectId) {
        try {
            const idFind = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
            return this.attributesRepository.findOne({ _id: idFind });
        } catch (error) {
            throw new RpcException(new ConflictException('Attribute Id is invalid'));
        }
    }

    async getAttributeByLabel(label: string) {
        return this.attributesRepository.findOne({ label });
    }

    async createAttribute({ label, name, description }: CreateAttributeDTO) {
        const newAttribute = {
            name,
            label,
            description,
        };
        if (await this.isExistAttributeLabel(label)) {
            throw new RpcException(new ConflictException('Attribute label is exist'));
        }
        return this.attributesRepository.create(newAttribute);
    }

    async isExistAttributeLabel(label: string) {
        try {
            await this.attributesRepository.findOne({ label });
            return true;
        } catch (err) {
            return false;
        }
    }

    async updateAttribute(newAttribute: UpdateAttributeDTO) {
        const { attributeId, name, description } = newAttribute;
        const updatedAttribute = await this.attributesRepository.findOneAndUpdate(
            {
                _id: attributeId,
            },
            { name, description },
        );

        return updatedAttribute;
    }

    async deleteAttribute(attributeId: string) {
        return this.attributesRepository.findOneAndUpdate(
            { _id: attributeId },
            {
                isDeleted: true,
            },
        );
    }
}
