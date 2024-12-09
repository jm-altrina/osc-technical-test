import { Resolver, Query, Arg, Ctx } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Collection } from '../../entities/Collection';
import { Context } from '../../context.type';

const prisma = new PrismaClient();

@Resolver(Collection)
export class CollectionResolver {
    @Query(() => [Collection])
    async collections(@Ctx() context: Context): Promise<Collection[]> {
        const { user } = context;

        if (!user) {
            throw new Error('Unauthorized');
        }

        // Admins see all collections; normal users see collections with their courses
        if (user.role === 'ADMIN') {
            return prisma.collection.findMany({
                include: { courses: true }, // Include related courses
            });
        } else {
            return prisma.collection.findMany({
                where: {
                    courses: {
                        some: {
                            userId: user.id, // Filter to collections with user's courses
                        },
                    },
                },
                include: { courses: true },
            });
        }
    }

    @Query(() => Collection, { nullable: true })
    async collection(
        @Ctx() context: Context,
        @Arg('id', () => Number) id: number,
    ): Promise<Collection | null> {
        const { user } = context;

        if (!user) {
            throw new Error('Unauthorized');
        }

        if (user.role === 'ADMIN') {
            // Admins can access any collection
            return prisma.collection.findUnique({
                where: { id },
                include: { courses: true }, // Include all courses in the collection
            });
        } else {
            // Normal users can only access collections containing their courses
            return prisma.collection.findFirst({
                where: {
                    id,
                    courses: {
                        some: {
                            userId: user.id, // Ensure the collection contains the user's courses
                        },
                    },
                },
                include: { courses: true },
            });
        }
    }
}
