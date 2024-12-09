import { AuthChecker } from 'type-graphql';
import { Context } from './context.type';

// Custom authChecker function
export const authChecker: AuthChecker<Context> = ({ context }, roles) => {
    const user = context.user;

    // If no user is in the context, deny access
    if (!user) {
        return false;
    }

    // If no roles are required, grant access
    if (roles.length === 0) {
        return true;
    }

    // Check if the user's role matches any of the required roles
    return roles.includes(user.role);
};
