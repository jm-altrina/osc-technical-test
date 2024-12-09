import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create an admin user
    const adminUsername = "admin";
    const adminPassword = await bcrypt.hash("adminpassword", 12);

    const admin = await prisma.user.upsert({
        where: { username: adminUsername },
        update: {}, // No updates if the admin user exists
        create: {
            username: adminUsername,
            password: adminPassword,
            role: "ADMIN",
        },
    });

    console.log(`Admin user created: ${admin.username}`);

    // Seed regular users
    const numberOfUsers = 100;
    const users: { username: string; password: string; role: Role }[] = [];

    for (let i = 1; i <= numberOfUsers; i++) {
        console.log(`Preparing user ${i} for seeding`);

        const username = `user${i}`;
        const hashedPassword = await bcrypt.hash(`password${i}`, 12);
        users.push({
            username,
            password: hashedPassword,
            role: Role.USER,
        });
    }

    await prisma.user.createMany({
        data: users,
        skipDuplicates: true, // Skip duplicates if users already exist
    });

    console.log(`Seeded ${numberOfUsers} regular users successfully!`);

    // Seed collections
    const numberOfCollections = 10;
    const collections: { name: string }[] = [];

    for (let i = 1; i <= numberOfCollections; i++) {
        console.log(`Preparing collection ${i} for seeding`);
        collections.push({
            name: faker.commerce.department(),
        });
    }

    await prisma.collection.createMany({
        data: collections,
        skipDuplicates: true, // Skip duplicates if collections already exist
    });

    console.log(`Seeded ${numberOfCollections} collections successfully!`);

    // Fetch all user IDs
    const existingUsers = await prisma.user.findMany({
        select: { id: true },
    });

    if (existingUsers.length === 0) {
        throw new Error("No users found in the database. Seed users first!");
    }

    const userIds = existingUsers.map((user) => user.id);

    // Fetch all collection IDs
    const existingCollections = await prisma.collection.findMany({
        select: { id: true },
    });

    if (existingCollections.length === 0) {
        throw new Error("No collections found in the database. Seed collections first!");
    }

    const collectionIds = existingCollections.map((collection) => collection.id);

    // Seed courses
    const numberOfCourses = 100;
    const courses: {
        title: string;
        description: string;
        duration: string;
        outcome: string;
        userId: number;
        collectionId: number;
    }[] = []; // Explicitly type array

    for (let i = 1; i <= numberOfCourses; i++) {
        console.log(`Preparing course ${i} for seeding`);

        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const randomCollectionId = collectionIds[Math.floor(Math.random() * collectionIds.length)];

        courses.push({
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            duration: `${faker.number.int({ min: 4, max: 16 })} weeks`,
            outcome: faker.lorem.sentence(),
            userId: randomUserId, // Assign to a random user
            collectionId: randomCollectionId, // Assign to a random collection
        });
    }

    await prisma.course.createMany({
        data: courses,
        skipDuplicates: true, // Skip duplicates if courses already exist
    });

    console.log(`Seeded ${numberOfCourses} courses successfully!`);
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });