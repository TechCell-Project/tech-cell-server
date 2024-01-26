import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Connection } from 'mongoose';
import { DB_TASK_CONSTANT } from './database-task.constant';
import { isTrueSet } from '~libs/common';

@Injectable()
export class DatabaseTaskService {
    private readonly logger = new Logger(DatabaseTaskService.name);

    constructor(
        @InjectConnection(DB_TASK_CONSTANT.primary.name)
        private readonly primaryConnection: Connection,
        @InjectConnection(DB_TASK_CONSTANT.backup.name)
        private readonly backupConnection: Connection,
        @InjectConnection(DB_TASK_CONSTANT.backup2.name)
        private readonly backupConnection2: Connection,
    ) {}

    /**
     * Auto copy all data on 4:00 AM every day from primary to backup database and backup2 database
     */
    @Cron('0 4 * * *', {
        name: 'copyPrimaryToBackup',
        timeZone: process.env.TZ ?? 'Asia/Ho_Chi_Minh',
    })
    async copyPrimaryToBackup(force = false) {
        this.logger.log('Start copy primary to backup');
        if (!isTrueSet(process.env.IS_ENABLE_BACKUP_MONGODB) && !force) {
            this.logger.log('Skip copy primary to backup because IS_BACKUP_MONGODB is false');
            return;
        }
        const currentDate = new Date();
        const backupDbName = `backup_${currentDate.getFullYear()}_${
            currentDate.getMonth() + 1
        }_${currentDate.getDate()}`;

        // Get a list of all collections in the primary database
        const collections = await this.primaryConnection.db.listCollections().toArray();

        // Iterate over each collection and copy its data to the backup databases
        for (const collection of collections) {
            // Log a message to indicate which collection is being copied
            this.logger.log(
                `Copy collection ${collection.name} from primary to backup and backup2`,
            );

            // Get references to the primary and backup collections
            const collectionName = collection.name;
            const primaryCollection = this.primaryConnection.collection(collectionName);

            const backupConnection = this.backupConnection.useDb(backupDbName);
            const backupConnection2 = this.backupConnection2.useDb(backupDbName);

            const backupCollection = backupConnection.collection(collectionName);
            const backupCollection2 = backupConnection2.collection(collectionName);

            // Get all documents in the primary collection and iterate over them
            const data = await primaryCollection.find().toArray();
            for (const doc of data) {
                // Delete any existing documents with the same ID in the backup collections
                await Promise.all([
                    backupCollection.deleteMany({ _id: doc._id }),
                    backupCollection2.deleteMany({ _id: doc._id }),
                ]);

                // Insert the document into the backup collections
                await Promise.all([
                    backupCollection.insertOne(doc),
                    backupCollection2.insertOne(doc),
                ]);
                this.logger.log(`Copy document ${doc._id} from primary to backup and backup2`);
            }
        }
    }
}
