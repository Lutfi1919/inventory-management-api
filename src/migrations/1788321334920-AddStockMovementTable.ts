import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockMovementTable1788321334920 implements MigrationInterface {
    name = 'AddStockMovementTable1788321334920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stock_movement_type_enum" AS ENUM('IN', 'OUT')`);
        await queryRunner.query(`CREATE TABLE "stock_movement" ("id" SERIAL NOT NULL, "type" "public"."stock_movement_type_enum" NOT NULL, "quantity" integer NOT NULL, "reason" text NOT NULL, "productId" integer NOT NULL, CONSTRAINT "PK_9fe1232f916686ae8cf00294749" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stock_movement" ADD CONSTRAINT "FK_9e1078f3037faf8730f384bb422" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_movement" DROP CONSTRAINT "FK_9e1078f3037faf8730f384bb422"`);
        await queryRunner.query(`DROP TABLE "stock_movement"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movement_type_enum"`);
    }

}
