export const DB_TASK_CONSTANT = {
    primary: {
        name: 'PRIMARY_MONGODB',
        uri: process.env.MONGODB_URI,
    },
    backup: {
        name: 'BACKUP_MONGODB',
        uri: process.env.MONGODB_URI_BACKUP,
    },
    backup2: {
        name: 'BACKUP_MONGODB_2',
        uri: process.env.MONGODB_URI_BACKUP_2,
    },
};
