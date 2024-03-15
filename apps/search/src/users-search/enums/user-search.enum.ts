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
    Manager = 'Manager',
    Staff = 'Staff',
    User = 'User',
    All = 'all_role',
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
