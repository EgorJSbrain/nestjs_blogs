import { UsersRepository } from './users.repository';
import { AppModule } from '../app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('UsersRepository', () => {
  let app: INestApplication
  let service: UsersRepository
  let mongoServer: MongoMemoryServer
  let mongoUri: string
  let db: typeof mongoose

  const responseData = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
  }

  const creatingUserData1 = {
    login: 'uer156',
    email: 'some@some.com',
    password: '123456'
  }

  const creatingUserData2 = {
    login: 'uer2',
    email: 'some2@some.com',
    password: '123456'
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
      providers: [UsersRepository],
    }).compile();

    mongoServer = await MongoMemoryServer.create()
    mongoUri = mongoServer.getUri()
    console.log("🚀 ~ file: users.repository.spec.ts:45 ~ beforeAll ~ mongoUri:", mongoUri)
    db = await mongoose.connect(mongoUri)

    app = module.createNestApplication()

    await app.init()

    service = module.get<UsersRepository>(UsersRepository);

  });

  afterAll(async () => {
    await app?.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('USERS - GET all - get empty array of users', async () => {
    const users = await service.getAll({})
    console.log("🚀 ~ file: users.repository.spec.ts:63 ~ it ~ users:", users)
    expect(users).toEqual(responseData)
  });

  it('USER - CREATE all - get empty array of users', async () => {
    const user = await service.createUser(creatingUserData1)

    expect(user.login).toBe(creatingUserData1.login)
    expect(user.email).toBe(creatingUserData1.email)
  });

  afterEach(async () => {
    try {
      await db.connection.collection('users').deleteMany({})
      // await mongoose.connection.collection('users').deleteMany({})
    } catch {
      await mongoose.connection.close()
    }
  })
});
