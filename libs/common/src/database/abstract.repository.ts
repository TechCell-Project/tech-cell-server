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
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { RpcException } from '@nestjs/microservices';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
    protected abstract readonly logger: Logger;

    constructor(
        protected readonly model: Model<TDocument>,
        private readonly connection: Connection,
    ) {}

    async create(document: Omit<TDocument, '_id'>, options?: SaveOptions): Promise<TDocument> {
        const createdDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        return (await createdDocument.save(options)).toJSON() as unknown as TDocument;
    }

    async findOne(
        filterQuery: FilterQuery<TDocument>,
        options?: Partial<QueryOptions<TDocument>>,
        projection?: ProjectionType<TDocument>,
    ): Promise<TDocument> {
        const document = await this.model.findOne(filterQuery, projection, {
            lean: true,
            ...options,
        });

        if (!document) {
            this.logger.warn(`${this.model.modelName} not found with filterQuery`, filterQuery);
            throw new RpcException(new NotFoundException(`${this.model.modelName} not found.`));
        }

        return document as unknown as TDocument;
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
        options?: Partial<QueryOptions<TDocument>>,
    ) {
        const document = await this.model.findOneAndUpdate(filterQuery, update, {
            lean: true,
            new: true,
            ...options,
        });

        if (!document) {
            this.logger.warn(`${this.model.modelName} not found with filterQuery:`, filterQuery);
            throw new RpcException(new NotFoundException(`${this.model.modelName} not found.`));
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
            throw new RpcException(new NotFoundException(`${this.model.modelName}s not found.`));
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
}
