import { Resolver, Mutation, Arg, Query, Authorized } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { User } from '../../entities/User';
import { RegisterInput, LoginInput } from './User.type';
import { UserRole } from '../../enums/UserRole';
import NodeCache from 'node-cache';
import logger from '../../../utils/logger';
import { generateToken } from '../../../utils/jwt';
import { TokenPayload } from '../../../utils/tokenPayload.type';
import { validate } from 'class-validator';

const prisma = new PrismaClient();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache with 1-hour TTL

@Resolver(User)
export class UserResolver {
    @Mutation(() => String)
    async register(
        @Arg('data', () => RegisterInput) data: RegisterInput,
    ): Promise<string> {
        const errors = await validate(data);
        if (errors.length > 0) {
            throw new Error(
                errors
                    .map((err) => Object.values(err.constraints || {}))
                    .join(', '),
            );
        }

        const { username, password } = data;

        // Check if the username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            throw new Error('Username already taken.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the new user
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'USER', // Default role
            },
        });

        // Invalidate cache for user list
        cache.del('users_all');

        return 'User registered successfully!';
    }

    @Mutation(() => String)
    async login(
        @Arg('data', () => LoginInput) data: LoginInput,
    ): Promise<string> {
        const { username, password } = data;

        // Find the user by username
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            throw new Error('Invalid username.');
        }

        // Verify the password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new Error('Invalid password.');
        }

        // Generate the JWT
        const payload: TokenPayload = {
            id: user.id,
            role: user.role as UserRole,
        };

        return generateToken(payload);
    }

    @Query(() => [User])
    @Authorized(['ADMIN']) // Lock access to admins only
    async users(): Promise<User[]> {
        const cacheKey = 'users_all';
        const cachedUsers = cache.get<User[]>(cacheKey);

        if (cachedUsers) {
            logger.info('Returning cached users');
            return cachedUsers;
        }

        const users = await prisma.user.findMany();
        cache.set(cacheKey, users); // Cache the result
        return users;
    }
}
