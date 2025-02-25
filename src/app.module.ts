import { Module } from '@nestjs/common';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  controllers: [UserController],
  providers: [UserService],
  exports: [HttpModule],
})
export class AppModule {}
