import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { AppModule } from '../app.module';
import { User, UserSchema } from './users.schema';
import { UsersRepository } from './users.repository';

describe('UsersController', () => {
  let app: INestApplication
  let controller: UsersController;
  let httpServer

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
      providers: [UsersRepository],
      controllers: [UsersRepository, UsersController],
    }).compile();

    app = module.createNestApplication()
    controller = module.get<UsersController>(UsersController);
    httpServer = app.getHttpServer()
  })

  // beforeEach(async () => {

  // });

  afterAll(async () => {
    await app?.close()
  })

  it('should be defined', () => {
    console.log("----controller:", controller)

    expect(controller).toBeDefined();
  });
});
