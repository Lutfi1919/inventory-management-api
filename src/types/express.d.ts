import type { JwtPayload } from "jsonwebtoken";
import type { UserRole } from "./users_roles.ts";

export interface AuthUser extends JwtPayload {
    id: number,
    email: string,
    role: UserRole,
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export {};