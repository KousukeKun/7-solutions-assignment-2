import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User, UserApiResponse, FormattedUserData } from './types';

@Injectable()
export class UserService {
  private readonly dummyUsersApiUrl = 'https://dummyjson.com/users';
  private readonly perPage = 30;

  constructor(private readonly httpService: HttpService) {}

  async getUsers(): Promise<User[]> {
    // Get first page to determine total users
    const { data } = await firstValueFrom(
      this.httpService.get<UserApiResponse>(
        `${this.dummyUsersApiUrl}?skip=0&limit=${this.perPage}`,
      ),
    );

    const total = data.total;
    const totalPages = Math.ceil(total / this.perPage);

    // The array of requests for all pages
    const requests = Array.from({ length: totalPages }, (_, i) => {
      const limit = this.perPage;
      const skip = limit * i;

      return firstValueFrom(
        this.httpService.get<UserApiResponse>(
          `${this.dummyUsersApiUrl}?skip=${skip}&limit=${limit}`,
        ),
      );
    });

    // Execute requests in parallel
    const responses = await Promise.all(requests);

    // Merge all user arrays
    return responses.flatMap((response) => response.data.users);
  }

  getDepartments(users: User[]) {
    const departmentsArr = users.map((user) => user.company.department);

    return [...new Set(departmentsArr)];
  }

  getUsersByDepartment(users: User[], department: string) {
    return users.filter((user) => user.company.department === department);
  }

  countUsersByGender(users: User[], gender: string) {
    return users.filter((user) => user.gender === gender).length;
  }

  getUsersAgeRange(users: User[]) {
    const userAgeArr = users.map((user) => user.age);
    const minAge = Math.min(...userAgeArr);
    const maxAge = Math.max(...userAgeArr);

    return `${minAge}-${maxAge}`;
  }

  groupingHairColor(users: User[]) {
    const hairColorArr = users.map((user) => user.hair.color);

    return hairColorArr.reduce<Record<string, number>>((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;

      return acc;
    }, {});
  }

  getMappingAddressUser(users: User[]) {
    return users.reduce<Record<string, string>>((acc, user) => {
      const objKey = `${user.firstName}${user.lastName}`;
      acc[objKey] = user.address.postalCode;

      return acc;
    }, {});
  }

  formattingUsersData(users: User[]): Record<string, FormattedUserData> {
    if (users.length === 0) {
      return {};
    }

    const departments = this.getDepartments(users);

    const formattedUsersDataRecords = Object.fromEntries(
      departments.map((department) => {
        const departmentUsers = this.getUsersByDepartment(users, department);

        const formattedData = {
          male: this.countUsersByGender(departmentUsers, 'male'),
          female: this.countUsersByGender(departmentUsers, 'female'),
          ageRange: this.getUsersAgeRange(departmentUsers),
          hair: this.groupingHairColor(departmentUsers),
          addressUser: this.getMappingAddressUser(departmentUsers),
        };

        return [department, formattedData];
      }),
    );

    return formattedUsersDataRecords;
  }
}
