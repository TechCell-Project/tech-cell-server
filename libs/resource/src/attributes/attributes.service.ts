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
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';
import { convertToObjectId } from '~libs/common';

@Injectable()
export class AttributesService {
    constructor(private readonly attributesRepository: AttributesRepository) {}

    async getAttributes({ filterQueries, queryOptions, projectionArgs }: IBaseQuery<Attribute>) {
        return this.attributesRepository.find({
            filterQuery: filterQueries,
            queryOptions: queryOptions,
            projection: projectionArgs,
        });
    }

    async getAttributeById(id: string | Types.ObjectId) {
        try {
            return this.attributesRepository.findOne({ _id: convertToObjectId(id) });
        } catch (error) {
            throw new RpcException(
                new BadRequestException(
                    I18nContext.current<I18nTranslations>().t('errorMessage.PROPERTY_ID_INVALID', {
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
                    I18nContext.current<I18nTranslations>().t(
                        'errorMessage.PROPERTY_LABEL_NOT_FOUND',
                        {
                            args: {
                                property: Attribute.name,
                                label: label,
                            },
                        },
                    ),
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
                    I18nContext.current<I18nTranslations>().t(
                        'errorMessage.PROPERTY_LABEL_IS_EXISTS',
                        {
                            args: {
                                property: Attribute.name,
                                label: label,
                            },
                        },
                    ),
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
                _id: convertToObjectId(attributeId),
            },
            { name, description },
        );
    }

    async deleteAttribute(attributeId: string) {
        return this.attributesRepository.findOneAndUpdate(
            {
                _id: convertToObjectId(attributeId),
            },
            {
                isDeleted: true,
            },
        );
    }

    async countAttributes(filterQueries: FilterQuery<Attribute> = {}) {
        return this.attributesRepository.count({ ...filterQueries });
    }
}
