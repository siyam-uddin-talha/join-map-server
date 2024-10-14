import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ROLE, User } from './entities';
import { CreateUserDTO } from './dto/create-user.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAll(query: any) {
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1; // Default page is 1
    const limit = query.params?.limit || 10; // Default limit is 10

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email ILIKE(:email)', { email: `%${keyword}%` })
      .orWhere("CONCAT  (user.firstName, ' ', user.lastName) ILIKE(:search)", {
        search: `%${keyword}%`,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async getById(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async getByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async create(data: CreateUserDTO): Promise<User> {
    const newUser = this.userRepository.create({ ...data, role: ROLE.USER });
    return await this.userRepository.save(newUser);
  }

  async update(file: any, id: string, data: UpdateUserDTO): Promise<User> {
    const { type, ...userInfo } = data;
    const user = await this.getById(id);

    if (!user) throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);

    if (type === 'new') {
      this.userRepository.merge(user, {
        ...userInfo,
        image: `${file.filename}`,
      });
    } else if (type === 'keep') {
      this.userRepository.merge(user, userInfo);
    } else {
      this.userRepository.merge(user, {
        ...userInfo,
        image: null,
      });
    }
    return await this.userRepository.save(user);
  }

  async updateEmailVerifiedAt(id: string): Promise<string> {
    const user = await this.getById(id);

    if (user.emailVerifiedAt !== null) {
      throw new BadRequestException('Email already confirm');
    }

    const updatedUser = Object.assign(user, {
      emailVerifiedAt: new Date(Date.now()).toISOString(),
    });

    const savedUser = await this.userRepository.save(updatedUser);

    return savedUser.id;
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await this.getById(id);

    const updatedUser = Object.assign(user, { password });

    return await this.userRepository.save(updatedUser);
  }
}
