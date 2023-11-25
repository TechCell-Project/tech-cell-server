import { Logger, NotFoundException } from '@nestjs/common';
import {
    FilterQuery,
    Model,
    Types,
    UpdateQuery,
    SaveOptions,
    Connection,
    QueryOptions,
    ProjectionType,
    ClientSession,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { RpcException } from '@nestjs/microservices';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
    protected abstract readonly logger: Logger;

    constructor(
        protected readonly model: Model<TDocument>,
        private readonly connection: Connection,
        private readonly i18n: I18nService<I18nTranslations>,
    ) {}

    async create(
        document: Omit<TDocument, '_id'>,
        options?: SaveOptions,
        session?: ClientSession,
    ): Promise<TDocument> {
        const createdDocument = new this.model({
            _id: new Types.ObjectId(),
            ...document,
        });
        return (
            await createdDocument.save({ ...options, session })
        ).toJSON() as unknown as TDocument;
    }

    async findOne(
        filterQuery: FilterQuery<TDocument>,
        options?: Partial<QueryOptions<TDocument>>,
        projection?: ProjectionType<TDocument>,
    ): Promise<TDocument> {
        const document = await this.model
            .findOne(filterQuery, projection, {
                ...options,
            })
            .lean(options?.lean ?? true);

        if (!document) {
            this.logger.warn(`${this.model.modelName} not found with filterQuery`, filterQuery);
            throw new RpcException(
                new NotFoundException(
                    this.i18n.t('errorMessage.MODEL_NOT_FOUND', {
                        args: { modelName: this.model.modelName },
                    }),
                ),
            );
        }

        return document as unknown as TDocument;
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
        options?: Partial<QueryOptions<TDocument>>,
        session?: ClientSession,
    ) {
        const document = await this.model
            .findOneAndUpdate(filterQuery, update, {
                lean: true,
                new: true,
                ...options,
            })
            .session(session);
        if (!document) {
            this.logger.warn(`${this.model.modelName} not found with filterQuery:`, filterQuery);
            throw new RpcException(
                new NotFoundException(
                    this.i18n.t('errorMessage.MODEL_NOT_FOUND', {
                        args: { modelName: this.model.modelName },
                    }),
                ),
            );
        }
        return document;
    }

    async upsert(filterQuery: FilterQuery<TDocument>, document: Partial<TDocument>) {
        return this.model.findOneAndUpdate(filterQuery, document, {
            lean: true,
            upsert: true,
            new: true,
        });
    }

    async find({
        filterQuery,
        queryOptions,
        projection,
        logEnabled = true,
    }: {
        filterQuery: FilterQuery<TDocument>;
        queryOptions?: Partial<QueryOptions<TDocument>>;
        projection?: ProjectionType<TDocument>;
        logEnabled?: boolean;
    }) {
        const document = await this.model.find(filterQuery, projection, {
            lean: true,
            ...queryOptions,
        });

        if (!document || document.length <= 0) {
            if (logEnabled) {
                this.logger.warn(
                    `${this.model.modelName}s not found with filterQuery:`,
                    filterQuery,
                );
            }
            throw new RpcException(
                new NotFoundException(
                    this.i18n.t('errorMessage.MODEL_NOT_FOUND', {
                        args: { modelName: this.model.modelName },
                    }),
                ),
            );
        }

        return document;
    }

    async startTransaction() {
        const session = await this.connection.startSession();
        session.startTransaction();
        return session;
    }

    async count(filterQuery: FilterQuery<TDocument>) {
        const countNum = await this.model.countDocuments(filterQuery);
        return countNum;
    }

    async updateOne(
        filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
        options?: QueryOptions<Partial<TDocument>>,
        session?: ClientSession,
    ) {
        return this.model.updateOne(filterQuery, update, options).session(session);
    }
}
