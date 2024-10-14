import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSuperUserDto } from './dto/create-super-user.dto';
import { UpdateSuperUserDto } from './dto/update-super-user.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { SuperUser } from './entities';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { TokenService } from '../token/token.service';

@Injectable()
export class SuperUserService {
  constructor(
    @InjectRepository(SuperUser)
    private readonly superUserRepository: Repository<SuperUser>,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}
  async getAll(query: any) {
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    return this.superUserRepository
      .createQueryBuilder('superUser')
      .where('superUser.address ILIKE(:address)', {
        address: `%${keyword}%`,
      })
      .orWhere('superUser.name ILIKE(:name)', {
        name: `%${keyword}%`,
      })
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
  }

  async getById(id: string): Promise<SuperUser> {
    return await this.superUserRepository.findOne({
      where: { id },
    });
  }

  async getByEmail(email: string): Promise<SuperUser> {
    return await this.superUserRepository.findOne({
      where: { email },
    });
  }

  async create(
    data: CreateSuperUserDto,
  ): Promise<{ superUser: SuperUser; randomString: string }> {
    const generateRandomString = (length: number) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      return result;
    };

    const randomString = generateRandomString(7);
    const hashOtp = await bcrypt.hash(randomString, 5);
    const newSuperUser = this.superUserRepository.create({
      ...data,
      otp: hashOtp,
    });

    const superUser = await this.superUserRepository.save(newSuperUser);

    // await this.mailerService.sendMail({
    //   to: data.email,
    //   subject: 'Join Map - One time password for you',
    //   html: `<span>One time password: ${randomString}</span>`,
    // });

    const { refreshToken } = await this.tokenService.generateTokens(
      superUser,
      'superUser',
    );

    await this.tokenService.create(superUser.id, refreshToken);

    return { superUser, randomString };
  }

  async update(id: string, data: UpdateSuperUserDto): Promise<SuperUser> {
    const superUser = await this.getById(id);

    if (!superUser)
      throw new NotFoundException(RESPONSE_MESSAGES.SUPER_USER_NOT_FOUND);

    this.superUserRepository.merge(superUser, data);
    return await this.superUserRepository.save(superUser);
  }

  async delete(id: string): Promise<any> {
    const superUser = await this.getById(id);

    if (!superUser)
      throw new NotFoundException(RESPONSE_MESSAGES.SUPER_USER_NOT_FOUND);

    return await this.superUserRepository.remove(superUser);
  }

  async updatePassword(id: string, password: string) {
    const superUser = await this.getById(id);

    const updatedSuperUser = Object.assign(superUser, { password });

    return this.superUserRepository.save(updatedSuperUser);
  }
}
