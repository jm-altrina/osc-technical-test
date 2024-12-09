import { Router } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { createSchema } from '../schema/schema';
import { verifyToken } from '../utils/jwt';

const router = Router();

(async () => {
    const schema = await createSchema();

    router.use(
        createHandler({
            schema,
            async context(req) {
                // Use type assertion for req.headers to specify the "authorization" field
                const authHeader = (req.headers as Record<string, string>)[
                    'authorization'
                ];

                let user = null;
                if (authHeader?.startsWith('Bearer ')) {
                    const token = authHeader.split(' ')[1];
                    try {
                        user = verifyToken(token);
                    } catch (err) {
                        console.error('Invalid token:', err);
                    }
                }

                return { req, user };
            },
        }),
    );
})();

export default router;
