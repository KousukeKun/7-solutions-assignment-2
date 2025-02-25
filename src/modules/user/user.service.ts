import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// import { userData } from './data';
import { User, UserApiResponse } from './types';

@Injectable()
export class UserService {
  private readonly dummyUsersApiUrl = 'https://dummyjson.com/users';
  private readonly perPage = 30;

  constructor(private readonly httpService: HttpService) {}

  async getUsers(): Promise<User[]> {
    // Get first page to determine total users
    const { data } = await firstValueFrom(
      this.httpService.get<UserApiResponse>(`${this.dummyUsersApiUrl}?skip=0&limit=${this.perPage}`)
    );

    const total = data.total;
    const totalPages = Math.ceil(total / this.perPage);

    // The array of requests for all pages
    const requests = Array.from({ length: totalPages }, (_, i) => {
      const limit = this.perPage;
      const skip = limit * i;
      
      return firstValueFrom(
        this.httpService.get<UserApiResponse>(
          `${this.dummyUsersApiUrl}?skip=${skip}&limit=${limit}`
        )
      )
    });

    // Execute requests in parallel
    const responses = await Promise.all(requests);

    // Merge all user arrays
    return responses.flatMap(response => response.data.users);
  }

  // Mock Data ...
  // async getUsers(): Promise<User[]> {
  //   return new Promise((resolve) => {
  //     resolve(userData);
  //   });
  // }
}
