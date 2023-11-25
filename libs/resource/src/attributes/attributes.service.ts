import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AttributesRepository } from './attributes.repository';
import { FilterQuery, Types } from 'mongoose';
import { CreateAttributeDTO, UpdateAttributeDTO } from './dtos';
import { IBaseQuery } from '../interfaces';
import { RpcException } from '@nestjs/microservices';
import { Attribute } from './schemas';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class AttributesService {
    constructor(
        private readonly attributesRepository: AttributesRepository,
        @I18n() private readonly i18n: I18nService<I18nTranslations>,
    ) {}

    async getAttributes({ filterQueries, queryOptions, projectionArgs }: IBaseQuery<Attribute>) {
        return this.attributesRepository.find({
            filterQuery: filterQueries,
            queryOptions: queryOptions,
            projection: projectionArgs,
        });
    }

    async getAttributeById(id: string | Types.ObjectId) {
        try {
            const idFind = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
            return this.attributesRepository.findOne({ _id: idFind });
        } catch (error) {
            throw new RpcException(
                new BadRequestException(
                    this.i18n.t('errorMessage.PROPERTY_ID_INVALID', {
                        args: {
                            modelName: Attribute.name,
                        },
                    }),
                ),
            );
        }
    }

    async getAttributeByLabel(label: string) {
        try {
            const attribute = await this.attributesRepository.findOne({ label });
            return attribute;
        } catch (error) {
            throw new RpcException(
                new NotFoundException(
                    this.i18n.t('errorMessage.PROPERTY_LABEL_NOT_FOUND', {
                        args: {
                            property: Attribute.name,
                            label: label,
                        },
                    }),
                ),
            );
        }
    }

    async createAttribute({ label, name, description }: CreateAttributeDTO) {
        const newAttribute = {
            name,
            label,
            description,
        };
        if (await this.isExistAttributeLabel(label)) {
            throw new RpcException(
                new ConflictException(
                    this.i18n.t('errorMessage.PROPERTY_LABEL_IS_EXISTS', {
                        args: {
                            property: Attribute.name,
                            label: label,
                        },
                    }),
                ),
            );
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
        return this.attributesRepository.findOneAndUpdate(
            {
                _id: attributeId,
            },
            { name, description },
        );
    }

    async deleteAttribute(attributeId: string) {
        return this.attributesRepository.findOneAndUpdate(
            { _id: attributeId },
            {
                isDeleted: true,
            },
        );
    }

    async countAttributes(filterQueries: FilterQuery<Attribute> = {}) {
        return this.attributesRepository.count({ ...filterQueries });
    }
}
