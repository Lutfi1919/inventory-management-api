import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentTable1790159843832 implements MigrationInterface {
    name = 'AddPaymentTable1790159843832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_method_enum" AS ENUM('cash', 'qris', 'tf')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'paid')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "reference_key" character varying(64) NOT NULL, "trx_id" character varying(64) NOT NULL, "method" "public"."payment_method_enum" NOT NULL, "amount" integer NOT NULL, "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_8c6b1b7f6bfe5a7306d7db140a0" UNIQUE ("reference_key"), CONSTRAINT "UQ_517bb4b45da84208a9f9ff7386c" UNIQUE ("trx_id"), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
    }

}
