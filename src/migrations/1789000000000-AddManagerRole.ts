import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddManagerRole1789000000000 implements MigrationInterface {
    name = "AddManagerRole1789000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."user_role_enum"
            ADD VALUE IF NOT EXISTS 'manager'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}