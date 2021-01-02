import {MigrationInterface, QueryRunner} from "typeorm";

export class Evoucher1609392460081 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`CREATE TABLE "evoucher" `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
