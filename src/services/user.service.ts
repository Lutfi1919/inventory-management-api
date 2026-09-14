import { AppDataSource } from "../data-source.ts";
import { User } from "../entities/User.ts";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async register(userData: User) {
        const newUser = this.userRepository.create(userData);
        
        return await this.userRepository.save(newUser);
    }

    async login(email: string, password: string) {
        const queryBuilder = this.userRepository.createQueryBuilder("user");

        const user = await queryBuilder.select(["user.id", "user.name", "user.email", "user.role"]).addSelect("user.password").where("user.email = :email", { email }).getOne();
        if (!user) {
            return null;
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
            { expiresIn: "2m" }
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
                createdAt: true,
                updatedAt: true
            }
        })

        return user;
    }
}