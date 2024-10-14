import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateAskChangeDto } from './dto/create-ask-change.dto';
import { UpdateAskChangeDto } from './dto/update-ask-change.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { AskChange } from './entities';
import { UserService } from '../user/user.service';
import { WindowService } from '../window/window.service';
import { REQUEST } from '../../constants/request-types';

@Injectable()
export class AskChangeService {
  constructor(
    @InjectRepository(AskChange)
    private readonly askChangeRepository: Repository<AskChange>,
    private readonly userService: UserService,
    private readonly windowService: WindowService,
  ) {}

  async getById(id: string): Promise<AskChange> {
    const askChange = await this.askChangeRepository.findOne({
      where: { id },
    });

    if (!askChange)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_CHANGE_NOT_FOUND);

    return askChange;
  }

  async create(data: CreateAskChangeDto, userId: string): Promise<AskChange> {
    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);
    }

    const window = await this.windowService.getById(data.windowId);

    if (!window) {
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);
    }

    const newAskChange = this.askChangeRepository.create({
      status: REQUEST.NEW_REQUEST,
      user: user,
      window: window,
    });
    return await this.askChangeRepository.save(newAskChange);
  }

  async update(
    id: string,
    data: UpdateAskChangeDto,
    file: any,
  ): Promise<AskChange> {
    const { type, status, comment } = data;
    const askChange = await this.getById(id);

    if (!askChange)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_CHANGE_NOT_FOUND);

    if (type === 'new') {
      this.askChangeRepository.merge(askChange, {
        status: status as REQUEST,
        comment,
        file: file.filename,
        originalFileName: file.originalname,
      });
    } else if (type === 'keep') {
      this.askChangeRepository.merge(askChange, {
        comment,
        status: status as REQUEST,
      });
    } else {
      this.askChangeRepository.merge(askChange, {
        status: status as REQUEST,
        comment,
        file: null,
        originalFileName: null,
      });
    }

    return await this.askChangeRepository.save(askChange);
  }

  async fetchSubmitStatus(
    window_id: string,
    userId: string,
  ): Promise<AskChange> {
    const window = await this.windowService.getById(window_id);

    if (!window)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);

    return await this.askChangeRepository.findOne({
      where: {
        window: { id: window_id },
        user: { id: userId },
        status: In([REQUEST.DONE, REQUEST.NEW_REQUEST, REQUEST.SCHEDULED]),
      },
    });
  }

  async cancelRequest(ask_change_id: string) {
    const askChange = await this.getById(ask_change_id);

    if (!askChange)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_CHANGE_NOT_FOUND);

    askChange.status = REQUEST.CLOSED;

    await this.askChangeRepository.save(askChange);
  }

  async fetchAll(query: any) {
    const windowId = query.params?.windowId || '';
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    const status = query.params?.status || '';
    let queryBuilder = this.askChangeRepository
      .createQueryBuilder('askChange')
      .leftJoinAndSelect('askChange.user', 'user')
      .leftJoinAndSelect('askChange.window', 'window')
      .leftJoinAndSelect('window.room', 'room')
      .leftJoinAndSelect('room.stage', 'stage')
      .leftJoinAndSelect('stage.hotel', 'hotel');

    if (windowId) {
      queryBuilder = queryBuilder.andWhere('askChange.window.id = :windowId', {
        windowId: windowId,
      });
    }

    if (status !== '') {
      queryBuilder = queryBuilder.andWhere('askChange.status = :status', {
        status: status,
      });
    } else {
      queryBuilder = queryBuilder.andWhere(
        'askChange.status IN (:...statuses)',
        {
          statuses: [
            REQUEST.NEW_REQUEST,
            REQUEST.DONE,
            REQUEST.CLOSED,
            REQUEST.SCHEDULED,
          ],
        },
      );
    }

    queryBuilder = queryBuilder.andWhere(
      "CONCAT(user.firstName, ' ', user.lastName) ILIKE(:search)",
      {
        search: `%${keyword}%`,
      },
    );

    const [results, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return [results, total];
  }

  async fetchStatistics(query: any) {
    const windowId = query.params?.windowId || '';
    const roomId = query.params?.roomId || '';
    const stageId = query.params?.stageId || '';
    const hotelId = query.params?.hotelId || '';
    let queryBuilder = this.askChangeRepository
      .createQueryBuilder('askChange')
      .leftJoinAndSelect('askChange.user', 'user')
      .leftJoinAndSelect('askChange.window', 'window')
      .leftJoinAndSelect('window.room', 'room')
      .leftJoinAndSelect('room.stage', 'stage')
      .leftJoinAndSelect('stage.hotel', 'hotel');

    if (windowId) {
      queryBuilder = queryBuilder.andWhere('askChange.window.id = :windowId', {
        windowId: windowId,
      });
    }

    if (roomId) {
      queryBuilder = queryBuilder.andWhere('room.id = :roomId', {
        roomId: roomId,
      });
    }

    if (stageId) {
      queryBuilder = queryBuilder.andWhere('stage.id = :stageId', {
        stageId: stageId,
      });
    }

    if (hotelId) {
      queryBuilder = queryBuilder.andWhere('hotel.id = :hotelId', {
        hotelId: hotelId,
      });
    }

    return await queryBuilder.getMany();
  }
}
