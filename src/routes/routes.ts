import { Router } from 'express';
import authRoutes from './auth.routes';
import graphqlRoutes from './graphql.routes';

const router = Router();

router.use('/login', authRoutes);
router.use('/graphql', graphqlRoutes);

export default router;
