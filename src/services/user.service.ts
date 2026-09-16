import { AppDataSource } from "../data-source.ts";
import { User } from "../entities/User.ts";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

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