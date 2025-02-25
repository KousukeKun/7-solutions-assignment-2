import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { UserApiResponse } from './types';
import { mockUsers, mockFormattedUsersData } from './mock';

describe('UserService', () => {
  let userService: UserService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUsers', () => {
    it('should fetch and return all users', async () => {
      const mockResponse: UserApiResponse = {
        skip: 0,
        limit: 30,
        total: 6,
        users: mockUsers,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        } as AxiosResponse<UserApiResponse>),
      );

      const result = await userService.getUsers();

      expect(result).toEqual(mockUsers);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDepartments', () => {
    it('should return unique departments', () => {
      const result = userService.getDepartments(mockUsers);
      expect(result).toEqual([
        'Engineering',
        'Support',
        'Research and Development',
        'Human Resources',
        'Product Management',
      ]);
    });
  });

  describe('getUsersByDepartment', () => {
    it('should return users belonging to a specific department', () => {
      const result = userService.getUsersByDepartment(mockUsers, 'Support');
      expect(result).toEqual([mockUsers[1], mockUsers[3]]);
    });
  });

  describe('countUsersByGender', () => {
    it('should return correct gender count', () => {
      expect(userService.countUsersByGender(mockUsers, 'male')).toBe(2);
      expect(userService.countUsersByGender(mockUsers, 'female')).toBe(4);
    });
  });

  describe('getUsersAgeRange', () => {
    it('should return the correct age range', () => {
      const result = userService.getUsersAgeRange(mockUsers);
      expect(result).toBe('22-45');
    });
  });

  describe('groupingHairColor', () => {
    it('should return correct hair color grouping', () => {
      const result = userService.groupingHairColor(mockUsers);
      expect(result).toEqual({
        Blonde: 1,
        Brown: 1,
        Gray: 1,
        Green: 1,
        White: 2,
      });
    });
  });

  describe('getMappingAddressUser', () => {
    it('should map users to postal codes', () => {
      const result = userService.getMappingAddressUser(mockUsers);
      expect(result).toEqual({
        EmilyJohnson: '29112',
        EmmaMiller: '26593',
        JamesDavis: '68354',
        MichaelWilliams: '38807',
        OliviaWilson: '83843',
        SophiaBrown: '32822',
      });
    });
  });

  describe('formattingUsersData', () => {
    it('should return formatted user data by department', () => {
      const result = userService.formattingUsersData(mockUsers);
      expect(result).toEqual(mockFormattedUsersData);
    });
  });
});
