import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../schema/enums/UserRole';

const prisma = new PrismaClient();
const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required.' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid username or password.' });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid username or password.' });
            return;
        }

        const token = generateToken({
            id: user.id,
            role: user.role as UserRole,
        });

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
