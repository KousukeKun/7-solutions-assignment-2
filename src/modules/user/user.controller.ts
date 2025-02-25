import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(): Promise<User[]> {
    const users = await this.userService.getUsers();

    return users;
  }
}
