import { buildSchema } from 'type-graphql';
import { authChecker } from './authChecker';
import { CourseResolver } from './resolvers/course/CourseResolver';
import { UserResolver } from './resolvers/user/UserResolver';
import { CollectionResolver } from './resolvers/collection/CollectionResolver';

export const createSchema = async () => {
    return await buildSchema({
        resolvers: [CourseResolver, UserResolver, CollectionResolver], // All resolvers goes here
        authChecker,
    });
};
