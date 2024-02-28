import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdateGameQuestionsAddAnswerId1709100155752 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('game_questions', {
            name: 'answerId',
            type: 'uuid',
            isNullable: true
          } as TableColumn)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('game_questions', 'answerId');
    }

}
