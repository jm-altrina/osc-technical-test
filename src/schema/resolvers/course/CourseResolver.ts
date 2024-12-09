import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Course } from '../../entities/Course';
import { Context } from '../../context.type';
import NodeCache from 'node-cache';
import logger from '../../../utils/logger';

const prisma = new PrismaClient();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL: 1 hour

@Resolver(Course)
export class CourseResolver {
    @Query(() => [Course])
    async courses(
        @Ctx() context: Context,
        @Arg('limit', () => Number, { nullable: true }) limit?: number,
        @Arg('sortOrder', () => String, { nullable: true })
        sortOrder: 'ASC' | 'DESC' = 'ASC',
    ): Promise<Course[]> {
        const { user } = context;

        if (!user) {
            throw new Error('Unauthorized');
        }

        const orderBy = sortOrder === 'DESC' ? 'desc' : 'asc';

        // Admins can see all courses; normal users can see only their courses
        const filter = user.role === 'ADMIN' ? {} : { userId: user.id };

        // Cache key
        const cacheKey = `courses_${JSON.stringify(filter)}_${orderBy}_${limit || 100}`;
        const cachedCourses = cache.get<Course[]>(cacheKey);

        if (cachedCourses) {
            logger.info('Returning cached courses');
            return cachedCourses;
        }

        const courses = await prisma.course.findMany({
            where: filter,
            orderBy: { id: orderBy },
            take: limit || 100,
        });

        cache.set(cacheKey, courses); // Cache the result
        return courses;
    }

    @Query(() => Course, { nullable: true })
    async course(
        @Ctx() context: Context,
        @Arg('id', () => Number) id: number,
    ): Promise<Course | null> {
        const { user } = context;

        if (!user) {
            throw new Error('Unauthorized');
        }

        // Admins can access any course; normal users can access only their own courses
        const whereClause =
            user.role === 'ADMIN'
                ? { id } // Admins: Match by ID
                : { id, userId: user.id }; // Normal users: Match by ID and userId

        return prisma.course.findUnique({
            where: whereClause,
        });
    }

    @Mutation(() => Course)
    async addCourse(
        @Ctx() context: Context,
        @Arg('title', () => String) title: string,
        @Arg('description', () => String) description: string,
        @Arg('duration', () => String) duration: string,
        @Arg('outcome', () => String) outcome: string,
        @Arg('assocatedUserId', () => Number, { nullable: true })
        assocatedUserId?: number,
    ): Promise<Course> {
        const { user } = context;

        if (!user) {
            throw new Error('Unauthorized');
        }

        // Admins can create course for any user; normal users can create their own courses
        const userId =
            user.role === 'ADMIN'
                ? assocatedUserId || user.id // Admins can specify, fallback to their own ID
                : user.id; // Normal users

        const course = await prisma.course.create({
            data: {
                title,
                description,
                duration,
                outcome,
                userId,
            },
        });

        // Invalidate course list cache
        cache.del(`courses_${JSON.stringify({ userId })}`);
        cache.del(`courses_${JSON.stringify({})}`); // Admin list

        return course;
    }

    @Mutation(() => Course)
    async updateCourse(
        @Ctx() context: Context,
        @Arg('id', () => Number) id: number,
        @Arg('title', () => String, { nullable: true }) title?: string,
        @Arg('description', () => String, { nullable: true })
        description?: string,
        @Arg('duration', () => String, { nullable: true }) duration?: string,
        @Arg('outcome', () => String, { nullable: true }) outcome?: string,
    ): Promise<Course> {
        const { user } = context;

        if (!user) {
            throw new Error('Unauthorized');
        }

        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            throw new Error(`Course with ID ${id} not found`);
        }

        // Check ownership or admin role
        if (user.role !== 'ADMIN' && course.userId !== user.id) {
            throw new Error('You are not authorized to update this course');
        }

        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (duration) updateData.duration = duration;
        if (outcome) updateData.outcome = outcome;

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: updateData,
        });

        // Invalidate cache for all course queries
        const cacheKeys = cache.keys();
        const courseListKeys = cacheKeys.filter((key) =>
            key.startsWith('courses_'),
        );

        courseListKeys.forEach((key) => cache.del(key)); // Clear all cached course lists

        return updatedCourse;
    }

    @Mutation(() => Boolean)
    async deleteCourse(
        @Arg('id', () => Number) id: number,
        @Ctx() context: Context,
    ): Promise<boolean> {
        const { user } = context;

        if (!user) {
            throw new Error('Unauthorized');
        }

        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            throw new Error(`Course with ID ${id} not found`);
        }

        if (user.role !== 'ADMIN' && course.userId !== user.id) {
            throw new Error('You are not authorized to delete this course');
        }

        await prisma.course.delete({
            where: { id },
        });

        // Invalidate course list cache
        cache.del(`courses_${JSON.stringify({ userId: course.userId })}`);
        cache.del(`courses_${JSON.stringify({})}`); // Admin list

        return true;
    }
}
