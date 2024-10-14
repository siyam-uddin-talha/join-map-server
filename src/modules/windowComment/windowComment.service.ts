import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateWindowCommentDto } from './dto/create-window-comment.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { WindowComment } from './entities';
import { UserService } from '../user/user.service';
import { WindowService } from '../window/window.service';
import { UpdateWindowCommentDto } from './dto/update-window-comment.dto';

@Injectable()
export class WindowCommentService {
  constructor(
    @InjectRepository(WindowComment)
    private readonly windowCommentRepository: Repository<WindowComment>,
    private readonly userService: UserService,
    private readonly windowService: WindowService,
  ) {}
  async getAll(query: any) {
    const windowId = query.params.windowId || null;
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    return this.windowCommentRepository
      .createQueryBuilder('windowComment')
      .leftJoinAndSelect('windowComment.user', 'user')
      .where("CONCAT  (user.firstName, ' ', user.lastName) ILIKE(:search)", {
        search: `%${keyword}%`,
      })
      .andWhere('windowComment.window.id = :windowId', {
        windowId: windowId,
      })
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
  }

  async fetchOneByWindow(
    window_id: string,
    userId: string,
  ): Promise<WindowComment> {
    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);
    }

    const window = await this.windowService.getById(window_id);

    if (!window) {
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);
    }

    return await this.windowCommentRepository.findOne({
      where: { window: { id: window_id }, user: { id: userId } },
    });
  }

  async getById(id: string): Promise<WindowComment> {
    const windowComment = await this.windowCommentRepository.findOne({
      where: { id },
    });

    if (!windowComment)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_COMMENT_NOT_FOUND);

    return windowComment;
  }

  async update(
    window_comment_id: string,
    data: UpdateWindowCommentDto,
  ): Promise<WindowComment> {
    const windowComment = await this.getById(window_comment_id);

    if (!windowComment)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_COMMENT_NOT_FOUND);

    this.windowCommentRepository.merge(windowComment, data);
    return await this.windowCommentRepository.save(windowComment);
  }

  async create(
    data: CreateWindowCommentDto,
    userId: string,
  ): Promise<WindowComment> {
    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);
    }

    const window = await this.windowService.getById(data.windowId);

    if (!window) {
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);
    }

    const newWindowComment = this.windowCommentRepository.create({
      comment: data.comment,
      user: user,
      window: window,
    });
    return await this.windowCommentRepository.save(newWindowComment);
  }
}
