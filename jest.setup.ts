import prismaMock from './src/__mocks__/prismaMock';

// Add any global mocks here
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => prismaMock),
}));