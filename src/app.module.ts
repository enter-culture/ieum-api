import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DestinationsModule } from './destinations/destinations.module';
import { HeritageModule } from './heritage/heritage.module';
import { Comment } from './comments/comment.entity';
import { CommentsModule } from './comments/comments.module';
import { Like } from './likes/like.entity';
import { LikesModule } from './likes/likes.module';
import { Onboarding } from './onboarding/onboarding.entity';
import { OnboardingModule } from './onboarding/onboarding.module';
import { UploadModule } from './upload/upload.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { Video } from './videos/video.entity';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 로컬: .env.local(실제 값) 우선, 그다음 .env(키 템플릿).
      // 배포(Render): 대시보드가 주입한 process.env가 그대로 사용됨(파일이 덮어쓰지 않음).
      envFilePath: ['.env.local', '.env'],
    }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        driver: PostgreSqlDriver,
        clientUrl: config.get<string>('DATABASE_URL'),
        entities: [User, Like, Video, Onboarding, Comment],
        // Supabase는 SSL 필수. v7(kysely/pg)에서는 ssl을 평탄하게 전달한다.
        driverOptions: { ssl: { rejectUnauthorized: false } },
      }),
    }),
    AuthModule,
    UsersModule,
    LikesModule,
    CommentsModule,
    VideosModule,
    DestinationsModule,
    HeritageModule,
    UploadModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
