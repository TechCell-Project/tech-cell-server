export enum UserSearchBlock {
    BLOCKED = 'blocked',
    UNBLOCKED = 'unblocked',
    ALL = 'all',
}

export enum UserSearchEmailVerified {
    VERIFIED = 'verified',
    UNVERIFIED = 'unverified',
    ALL = 'all',
}

export enum UserSearchRole {
    SUPER_ADMIN = 'SuperAdmin',
    ADMIN = 'Admin',
    MOD = 'Mod',
    USER = 'User',
    ALL = 'all_role',
}

export enum UserSearchSortOrder {
    ASC = 'ascending',
    DESC = 'descending',
}

export enum UserSearchSortField {
    EMAIL = 'email',
    USERNAME = 'userName',
    FIRST_NAME = 'firstName',
    LAST_NAME = 'lastName',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}
