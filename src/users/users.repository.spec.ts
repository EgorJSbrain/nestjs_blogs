import { UsersRepository } from './users.repository';
import { AppModule } from '../app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';

describe('UsersRepository', () => {
  let app: INestApplication
  let service: UsersRepository

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
      providers: [UsersRepository],
    }).compile();

    app = module.createNestApplication()

    await app.init()

    service = module.get<UsersRepository>(UsersRepository);

  });

  afterAll(async () => {
    await app?.close()
  })

  it('should be defined', () => {
    console.log("----service:", service)

    expect(service).toBeDefined();
  });
});
