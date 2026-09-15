import { AppDataSource } from "../data-source.ts";
import { User } from "../entities/User.ts";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserStatus } from "../types/users_status.ts";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async register(userData: User) {
        const newUser = this.userRepository.create(userData);
        
        return await this.userRepository.save(newUser);
    }

    async login(email: string, password: string) {
        const queryBuilder = this.userRepository.createQueryBuilder("user");

        const user = await queryBuilder.select(["user.id", "user.name", "user.email", "user.role", "user.status"]).addSelect("user.password").where("user.email = :email", { email }).getOne();
        if (!user) {
            return null;
        }

        if (user.status === UserStatus.INACTIVE) {
            return { inactive: true };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
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

    async profile(id: number) {
        const user = this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return user;
    }

    async getAllUser() {
        return await this.userRepository.find();
    }

    async getUserById(id: number) {
        return await this.userRepository.findOneBy({ id });
    }

    async createUser(userData: User) {
        const newUser = this.userRepository.create(userData);
        
        return await this.userRepository.save(newUser);
    }

    async updateUserById(id: number, userData: User) {
        const user = await this.userRepository.preload({
            ...userData,
            id
        });

        if (!user) {
            return null;
        }

        return await this.userRepository.save(user);
    }

    async deleteById(id: number) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            return null;
        }

        return await this.userRepository.delete({ id });
    }
}