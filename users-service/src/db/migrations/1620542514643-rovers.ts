import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class Rovers1620542514643 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        columns: [
          {
            isPrimary: true,
            length: "36",
            name: "id",
            type: "char",
          },
          {
            length: "36",
            name: "userId",
            type: "char",
            isNullable: true,
          },
          {
            length: "36",
            name: "userSessionId",
            type: "char",
            isNullable: true,
          },
          {
            default: "now()",
            name: "createdAt",
            type: "timestamp",
          },
          {
            name: "expiresAt",
            type: "datetime",
          },
          {
            length: "36",
            name: "typ",
            type: "char",
          },
          {
            length: "36",
            name: "energy",
            type: "integer",
          },
          {
            length: "36",
            name: "status",
            type: "char",
          },
        ],
        name: "rovers",
      })
    );
    // await queryRunner.createForeignKey(
    //   "rovers",
    //   new TableForeignKey({
    //     columnNames: ["sessionId"],
    //     referencedColumnNames: ["id"],
    //     referencedTableName: "userSessions",
    //   })
    // );
    // await queryRunner.createForeignKey(
    //   "rovers",
    //   new TableForeignKey({
    //     columnNames: ["userId"],
    //     referencedColumnNames: ["id"],
    //     referencedTableName: "users",
    //   })
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("rovers");
  }
}
