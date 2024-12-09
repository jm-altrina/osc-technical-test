import { Request } from 'express';
import { UserRole } from '../schema/enums/UserRole';

export interface Context {
    req: Request;
    user?: {
        id: number;
        role: UserRole;
    };
}
