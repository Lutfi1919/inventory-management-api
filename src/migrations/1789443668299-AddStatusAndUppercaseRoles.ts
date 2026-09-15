import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusAndUppercaseRoles1789443668299 implements MigrationInterface {
    name = 'AddStatusAndUppercaseRoles1789443668299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "status" "public"."user_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'MANAGER', 'USER')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING (CASE "role"::text WHEN 'admin' THEN 'ADMIN' WHEN 'manager' THEN 'MANAGER' WHEN 'user' THEN 'USER' END)::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'user', 'manager')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING (CASE "role"::text WHEN 'ADMIN' THEN 'admin' WHEN 'MANAGER' THEN 'manager' WHEN 'USER' THEN 'user' END)::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    }

}
