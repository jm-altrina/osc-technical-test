import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class Course {
    @Field(() => ID)
    id: number = 0;

    @Field(() => String)
    title: string = '';

    @Field(() => String, { nullable: true }) // Optional field
    description?: string;

    @Field(() => String)
    duration: string = '';

    @Field(() => String, { nullable: true }) // Optional field
    outcome?: string;
}
