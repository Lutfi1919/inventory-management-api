import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentFieldsAndExpiredStatus1790239685842 implements MigrationInterface {
    name = 'AddPaymentFieldsAndExpiredStatus1790239685842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD "vaNumber" bigint`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "qrString" character varying`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "expiredAt" bigint`);
        await queryRunner.query(`ALTER TYPE "public"."payment_status_enum" ADD VALUE 'expired'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum_old" AS ENUM('pending', 'paid')`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "status" TYPE "public"."payment_status_enum_old" USING "status"::"text"::"public"."payment_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_status_enum_old" RENAME TO "payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "qrString"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "vaNumber"`);
    }

}
