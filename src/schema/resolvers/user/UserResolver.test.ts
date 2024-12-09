import 'reflect-metadata';
import { UserResolver } from './UserResolver';
import bcrypt from 'bcrypt';
import prismaMock from '../../../__mocks__/prismaMock';
import { RegisterInput } from './User.type';
import { validate } from 'class-validator';

jest.mock('class-validator', () => {
    const originalModule = jest.requireActual('class-validator');
    return {
        ...originalModule,
        validate: jest.fn(),
    };
});

jest.mock('bcrypt');

describe('UserResolver', () => {
    let resolver: UserResolver;

    beforeEach(() => {
        resolver = new UserResolver();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a user successfully', async () => {
            const data: RegisterInput = {
                username: 'testuser',
                password: 'password123',
            };

            (validate as jest.Mock).mockResolvedValue([]); // No validation errors
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword'); // Password is hashed
            (prismaMock.user.create as jest.Mock).mockResolvedValue({
                id: 1,
                username: data.username,
                password: 'hashedPassword',
                role: 'USER',
            });

            const result = await resolver.register(data);

            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { username: data.username },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
            expect(prismaMock.user.create).toHaveBeenCalledWith({
                data: {
                    username: data.username,
                    password: 'hashedPassword',
                    role: 'USER',
                },
            });
            expect(result).toBe('User registered successfully!');
        });

        it('should throw an error if validation fails', async () => {
            const data: RegisterInput = {
                username: '',
                password: 'short',
            };

            (validate as jest.Mock).mockResolvedValue([
                {
                    constraints: { isNotEmpty: 'Username is required' },
                },
            ]);

            await expect(resolver.register(data)).rejects.toThrow(
                'Username is required',
            );
        });

        it('should throw an error if username is taken', async () => {
            const data: RegisterInput = {
                username: 'testuser',
                password: 'password123',
            };

            (validate as jest.Mock).mockResolvedValue([]); // No validation errors
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                username: data.username,
                password: 'hashedPassword',
                role: 'USER',
            });

            await expect(resolver.register(data)).rejects.toThrow(
                'Username already taken.',
            );
        });
    });
});
