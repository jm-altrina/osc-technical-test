import { UserRole } from '../schema/enums/UserRole';

export interface TokenPayload {
    id: number;
    role: UserRole;
}
