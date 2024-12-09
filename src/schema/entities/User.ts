import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class User {
    @Field(() => ID)
    id!: number; // The unique identifier for a user

    @Field(() => String)
    username!: string; // The username for login

    @Field(() => String)
    role!: string; // The user's role (e.g., ADMIN, USER)

    // Omitting password from `@Field()` to prevent exposure
    password!: string;
}
