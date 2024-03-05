import { INestApplication } from '@nestjs/common';
import { DataSource, getConnection } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { GamesController } from './games.controller';
import { GamesRepository } from './games.repository';
import { ProgressesRepository } from '../progresses/progresses.repository';
import { CheckPalyerInGameUseCase } from './use-cases/check-player-in-game-use-case';
import { GamesService } from './games.service';

describe('GamesController', () => {
  let app: INestApplication
  let controller: GamesController;
  let gamesRepository: GamesRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]),
          },
        },
        {
          provide: DataSource,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]),
          },
        },
        {
          provide: ProgressesRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]),
          },
        },
        {
          provide: CheckPalyerInGameUseCase,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]),
          },
        },
        {
          provide: GamesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    gamesRepository = module.get<GamesRepository>(GamesRepository);
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
})
