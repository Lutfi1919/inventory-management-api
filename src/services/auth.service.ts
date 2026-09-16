import { AppDataSource } from "../data-source.ts";
import { User } from "../entities/User.ts";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserStatus } from "../types/users_status.ts";

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    async register(userData: User) {
        const newUser = this.userRepository.create(userData);
        
        return await this.userRepository.save(newUser);
    }

    async login(userData: User) {
        const queryBuilder = this.userRepository.createQueryBuilder("user");

        const user = await queryBuilder.select(["user.id", "user.name", "user.email", "user.role", "user.status"]).addSelect("user.password").where("user.email = :email", { email: userData.email }).getOne();
        if (!user) {
            return null;
        }

        if (user.status === UserStatus.INACTIVE) {
            return { inactive: true };
        }

        const isPasswordValid = await bcrypt.compare(userData.password, user.password)
        if (!isPasswordValid) {
            return null
        }
        
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET!, 
            { expiresIn: "40m" }
        );

        return { user, token };
    }
}