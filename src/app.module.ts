import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DestinationsModule } from './destinations/destinations.module';
import { HeritageModule } from './heritage/heritage.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 로컬: .env.local(실제 값) 우선, 그다음 .env(키 템플릿).
      // 배포(Render): 대시보드가 주입한 process.env가 그대로 사용됨(파일이 덮어쓰지 않음).
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    DestinationsModule,
    HeritageModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
