import { AppModule } from '../app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';

dotenv.config({
  path: 'local.env',
});

describe('UsersRepository', () => {
  let app: INestApplication
  let service: any
  let mongoServer: MongoMemoryServer
  let mongoUri: string
  let db: typeof mongoose
  let configService: ConfigService;

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
      imports: [
        AppModule,
        ConfigModule,
      ],
      providers: [],
    }).compile();

    configService = new ConfigService()
    mongoServer = await MongoMemoryServer.create()
    mongoUri = mongoServer.getUri()
    db = await mongoose.connect(configService.get('DATABASE_URL') ?? '')

    app = module.createNestApplication()

    await app.init()
  });

  afterAll(async () => {
    await app?.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('USERS - GET all - get empty array of users', async () => {
    const users = await service.getAll({})
    expect(users).toEqual(responseData)
    expect(users!.totalCount).toBe(0)
  });

  it('USERS - GET all - create user and check array of users', async () => {
    const user = await service.createUser(creatingUserData1)

    const users = await service.getAll({})
    expect(users!.items[0].login).toBe(user.login)
    expect(users!.items[0].email).toBe(user.email)
    expect(users!.totalCount).toBe(1)
  });

  it('USERS - CREATE - create users and check array of users and serch by searchLoginTerm', async () => {
    const user1 = await service.createUser(creatingUserData1)
    await service.createUser(creatingUserData2)

    const users = await service.getAll({ searchLoginTerm: user1.login })
    expect(users!.items[0].login).toBe(user1.login)
    expect(users!.items[0].email).toBe(user1.email)
    expect(users!.totalCount).toBe(1)
  });

  it('USERS - CREATE - create users and check array of users check totalCount', async () => {
    await service.createUser(creatingUserData1)
    await service.createUser(creatingUserData2)

    const users = await service.getAll({})
    expect(users!.totalCount).toBe(2)
  });

  it('USER - CREATE - create and check user in db', async () => {
    const user = await service.createUser(creatingUserData1)

    expect(user.login).toBe(creatingUserData1.login)
    expect(user.email).toBe(creatingUserData1.email)
  });

  it('USER - GET - create and get user by email', async () => {
    const createdUser = await service.createUser(creatingUserData1)

    const user = await service.getUserByEmail(createdUser.email)
    expect(user!.login).toBe(createdUser.login)
    expect(user!.email).toBe(createdUser.email)
  });

  it('USER - GET - create and get user by login', async () => {
    const createdUser = await service.createUser(creatingUserData1)

    const user = await service.getUserByLoginOrEmail(createdUser.login)
    expect(user!.login).toBe(createdUser.login)
    expect(user!.email).toBe(createdUser.email)
  });

  afterEach(async () => {
    try {
      await db.connection.collection('users').deleteMany({})
    } catch {
      await mongoose.connection.close()
    }
  })
});
