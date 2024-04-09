import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { BlogEntity } from './src/entities/blog';
import { CommentEntity } from './src/entities/comment';
import { CommentLikeEntity } from './src/entities/comment-like';
import { DeviceEntity } from './src/entities/devices';
import { PostEntity } from './src/entities/post';
import { PostLikeEntity } from './src/entities/post-like';
import { UserEntity } from './src/entities/user';
import { QuestionEntity } from './src/entities/question';
import { ProgressEntity } from './src/entities/progress';
import { AnswerEntity } from './src/entities/answer';
import { GameQuestionEntity } from './src/entities/game-question';
import { GameEntity } from './src/entities/game';
import { BanUsersBlogsEntity } from './src/entities/ban-users-blogs';
import { FileEntity } from './src/entities/files';
import { UsersBlogsEntity } from './src/entities/users-blogs';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

export default new DataSource({
  logger: 'simple-console',
  logging: ['error', 'warn', 'migration'],
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [
    BlogEntity,
    CommentEntity,
    CommentLikeEntity,
    DeviceEntity,
    PostEntity,
    PostLikeEntity,
    UserEntity,
    QuestionEntity,
    ProgressEntity,
    AnswerEntity,
    GameQuestionEntity,
    GameEntity,
    BanUsersBlogsEntity,
    FileEntity,
    UsersBlogsEntity,
  ],
  synchronize: false,
  migrations:
    process.env.DB_MIGRATION_ENABLED === 'true'
      ? (function () {
          console.log('*****DB migration initiated*****');

          return fs
            .readdirSync(path.join(__dirname, 'src', 'migrations'))
            .map((i) => path.join('.', 'src', 'migrations', i));
        })()
      : (function () {
          console.log('*****DB migration disabled*****');

          return undefined;
        })(),
});
