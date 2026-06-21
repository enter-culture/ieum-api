import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
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
      // 재로그인 시 email/name은 갱신하되, picture는 건드리지 않는다.
      // (사용자가 업로드한 커스텀 아바타가 구글 사진으로 덮어쓰이지 않도록)
      user.email = profile.email;
      user.name = profile.name;
    }
    await this.em.flush();
    return user;
  }

  findById(id: number): Promise<IUser | null> {
    return this.em.findOne(User, { id });
  }

  /** 프로필 부분 수정. 전달된 필드만 갱신한다. */
  async updateProfile(id: number, dto: UpdateUserDto): Promise<IUser> {
    const user = await this.em.findOne(User, { id });
    if (!user) throw new NotFoundException('User not found');

    if (dto.nickname !== undefined) user.nickname = dto.nickname;
    if (dto.region !== undefined) user.region = dto.region;
    if (dto.category !== undefined) user.category = dto.category;
    if (dto.picture !== undefined) user.picture = dto.picture;

    await this.em.flush();
    return user;
  }
}
