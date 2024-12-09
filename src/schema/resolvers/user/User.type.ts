import { InputType, Field } from 'type-graphql';
import { Length, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../enums/UserRole';
import { Type } from 'class-transformer';

@InputType()
export class RegisterInput {
    @Field(() => String)
    @IsNotEmpty({ message: 'Username is required' })
    @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
    @Type(() => String) // Ensures the field is treated as a string
    username!: string;

    @Field(() => String)
    @IsNotEmpty({ message: 'Password is required' })
    @Length(8, 50, { message: 'Password must be between 8 and 50 characters' })
    @Type(() => String)
    password!: string;

    @Field(() => UserRole, { nullable: true }) // Use the enum for roles
    @IsEnum(UserRole, { message: 'Role must be either ADMIN or USER' }) // Validate against the enum
    @IsOptional() // Allow this field to be omitted; defaults to USER
    role?: UserRole = UserRole.USER; // Default to USER if not provided
}

@InputType()
export class LoginInput {
    @Field(() => String)
    @IsNotEmpty()
    username!: string;

    @Field(() => String)
    @IsNotEmpty()
    password!: string;
}
