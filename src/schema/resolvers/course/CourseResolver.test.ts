import 'reflect-metadata';
import { CourseResolver } from './CourseResolver';
import prismaMock from '../../../__mocks__/prismaMock';
import { Context } from '../../context.type';
import { UserRole } from '../../enums/UserRole';
import { createMockRequest } from '../../../utils/testUtils';

describe('CourseResolver', () => {
    let resolver: CourseResolver;
    const mockContext: Context = {
        req: createMockRequest(),
        user: { id: 1, role: UserRole.USER },
    };

    beforeEach(() => {
        resolver = new CourseResolver();
        jest.clearAllMocks(); // Reset mocks before each test
    });

    describe('courses', () => {
        it('should fetch courses from the database', async () => {
            const dbCourses = [
                {
                    id: 1,
                    title: 'DB Course',
                    description: 'Description',
                    duration: '10h',
                    outcome: 'Outcome',
                    userId: 1,
                    collectionId: null,
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date('2023-01-02'),
                },
            ];

            prismaMock.course.findMany.mockResolvedValue(dbCourses);

            const result = await resolver.courses(mockContext);

            expect(prismaMock.course.findMany).toHaveBeenCalledWith({
                where: { userId: mockContext.user?.id },
                orderBy: { id: 'asc' },
                take: 100,
            });
            expect(result).toEqual(dbCourses);
        });

        it('should throw an error if the user is unauthorized', async () => {
            const unauthorizedContext: Context = {
                req: createMockRequest(),
                user: undefined,
            };

            await expect(resolver.courses(unauthorizedContext)).rejects.toThrow(
                'Unauthorized',
            );
        });
    });

    describe('addCourse', () => {
        it('should add a course', async () => {
            const newCourse = {
                id: 1,
                title: 'New Course',
                description: 'New Course Description',
                duration: '5h',
                outcome: 'Outcome',
                userId: mockContext.user?.id ? mockContext.user.id : 1,
                collectionId: null,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
            };

            prismaMock.course.create.mockResolvedValue(newCourse);

            const result = await resolver.addCourse(
                mockContext,
                'New Course',
                'New Course Description',
                '5h',
                'Outcome',
            );

            expect(prismaMock.course.create).toHaveBeenCalledWith({
                data: {
                    title: 'New Course',
                    description: 'New Course Description',
                    duration: '5h',
                    outcome: 'Outcome',
                    userId: mockContext.user?.id,
                },
            });
            expect(result).toEqual(newCourse);
        });

        it('should throw an error if the user is unauthorized', async () => {
            const unauthorizedContext: Context = {
                req: createMockRequest(),
                user: undefined,
            };

            await expect(
                resolver.addCourse(
                    unauthorizedContext,
                    'Title',
                    'Description',
                    'Duration',
                    'Outcome',
                ),
            ).rejects.toThrow('Unauthorized');
        });
    });

    describe('updateCourse', () => {
        it('should update a course', async () => {
            const existingCourse = {
                id: 1,
                title: 'Existing Course',
                description: 'Description',
                duration: '5h',
                outcome: 'Outcome',
                userId: mockContext.user?.id ? mockContext.user.id : 1,
                collectionId: null,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-03'),
            };

            const updatedCourse = {
                ...existingCourse,
                title: 'Updated Title',
            };

            prismaMock.course.findUnique.mockResolvedValue(existingCourse);
            prismaMock.course.update.mockResolvedValue(updatedCourse);

            const result = await resolver.updateCourse(
                mockContext,
                1,
                'Updated Title',
            );

            expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(prismaMock.course.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { title: 'Updated Title' },
            });
            expect(result).toEqual(updatedCourse);
        });

        it('should throw an error if the course does not exist', async () => {
            prismaMock.course.findUnique.mockResolvedValue(null);

            await expect(
                resolver.updateCourse(mockContext, 1, 'Updated Title'),
            ).rejects.toThrow('Course with ID 1 not found');
        });

        it('should throw an error if the user is unauthorized', async () => {
            const unauthorizedContext: Context = {
                req: createMockRequest(),
                user: undefined,
            };

            await expect(
                resolver.updateCourse(unauthorizedContext, 1, 'Updated Title'),
            ).rejects.toThrow('Unauthorized');
        });
    });

    describe('deleteCourse', () => {
        it('should delete a course', async () => {
            const existingCourse = {
                id: 1,
                title: 'Existing Course',
                description: 'Description',
                duration: '5h',
                outcome: 'Outcome',
                userId: mockContext.user?.id ? mockContext.user.id : 1,
                collectionId: null,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
            };

            prismaMock.course.findUnique.mockResolvedValue(existingCourse);
            prismaMock.course.delete.mockResolvedValue(existingCourse);

            const result = await resolver.deleteCourse(1, mockContext);

            expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(prismaMock.course.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toBe(true);
        });

        it('should throw an error if the course does not exist', async () => {
            prismaMock.course.findUnique.mockResolvedValue(null);

            await expect(resolver.deleteCourse(1, mockContext)).rejects.toThrow(
                'Course with ID 1 not found',
            );
        });

        it('should throw an error if the user is unauthorized', async () => {
            const unauthorizedContext: Context = {
                req: createMockRequest(),
                user: undefined,
            };

            await expect(
                resolver.deleteCourse(1, unauthorizedContext),
            ).rejects.toThrow('Unauthorized');
        });
    });
});
