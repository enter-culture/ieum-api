import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { OnboardingController } from './onboarding.controller';
import { Onboarding } from './onboarding.entity';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [MikroOrmModule.forFeature([Onboarding, User]), AuthModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
