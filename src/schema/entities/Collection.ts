import { ObjectType, Field, ID } from 'type-graphql';
import { Course } from './Course';

@ObjectType()
export class Collection {
    @Field(() => ID)
    id!: number;

    @Field(() => String) // Explicitly specify the type as String
    name!: string;

    @Field(() => [Course], { nullable: true }) // Explicitly specify the type as an array of Course
    courses?: Course[];
}
