import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { IUser, User } from './user.entity';

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  /** 구글 프로필로 User upsert (없으면 생성, 있으면 갱신). */
  async upsertFromGoogle(profile: GoogleProfile): Promise<IUser> {
    let user = await this.em.findOne(User, { googleId: profile.sub });
    if (!user) {
      user = this.em.create(User, {
        googleId: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      });
    } else {
      user.email = profile.email;
      user.name = profile.name;
      user.picture = profile.picture;
    }
    await this.em.flush();
    return user;
  }

  findById(id: number): Promise<IUser | null> {
    return this.em.findOne(User, { id });
  }
}
