import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser() {
    const users = await this.userService.getUsers();
    const formattedUsersData = this.userService.formattingUsersData(users);

    return formattedUsersData;
  }
}
