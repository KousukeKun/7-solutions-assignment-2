import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { mockUsers, mockFormattedUsersData } from './mock';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUsers: jest.fn().mockResolvedValue(mockUsers),
            formattingUsersData: jest
              .fn()
              .mockReturnValue(mockFormattedUsersData),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getUser', () => {
    it('should return formatted user data', async () => {
      const result = await userController.getUser();

      expect(userService.getUsers).toHaveBeenCalledTimes(1);
      expect(userService.formattingUsersData).toHaveBeenCalledWith(mockUsers);
      expect(result).toEqual(mockFormattedUsersData);
    });
  });
});
