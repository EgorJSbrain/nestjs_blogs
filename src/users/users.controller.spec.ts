import { INestApplication } from '@nestjs/common';

describe('UsersController', () => {
  let app: INestApplication
  let controller: any;
  let configService: any;
  let httpServer

  beforeAll(async () => {
  })

  // beforeEach(async () => {

  // });

  afterAll(async () => {
    await app?.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
