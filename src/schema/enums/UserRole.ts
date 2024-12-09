import { registerEnumType } from 'type-graphql';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

registerEnumType(UserRole, {
    name: 'UserRole', // The name that will appear in GraphQL schema
    description: 'The roles that a user can have', // Optional description
});
