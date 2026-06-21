import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { Like } from './like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [MikroOrmModule.forFeature([Like, User]), AuthModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
