import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateAskWorkDto } from './dto/create-ask-work.dto';
import { UpdateAskWorkDto } from './dto/update-ask-work.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { AskWork } from './entities';
import { UserService } from '../user/user.service';
import { WindowService } from '../window/window.service';
import { REQUEST } from '../../constants/request-types';
import { UpdateAskWorkOnUserDto } from './dto/update-ask-work-user.dto';
import { WorkerService } from '../worker/worker.service';

@Injectable()
export class AskWorkService {
  constructor(
    @InjectRepository(AskWork)
    private readonly askWorkRepository: Repository<AskWork>,
    private readonly userService: UserService,
    private readonly windowService: WindowService,
    private readonly workerService: WorkerService,
  ) {}

  async getById(id: string): Promise<AskWork> {
    const askWork = await this.askWorkRepository.findOne({
      where: { id },
      relations: ['workers'],
    });

    if (!askWork)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_WORK_NOT_FOUND);

    return askWork;
  }

  async create(
    data: CreateAskWorkDto,
    userId: string,
    files: any,
  ): Promise<AskWork> {
    const { windowId, ...rest } = data;
    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);
    }

    const window = await this.windowService.getById(windowId);

    if (!window) {
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);
    }

    const newAskWork = this.askWorkRepository.create({
      ...rest,
      status: REQUEST.NEW_REQUEST,
      user: user,
      window: window,
      completedFile: files.completedFile[0].filename,
      defaultFile: files.defaultFile[0].filename,
    });
    return await this.askWorkRepository.save(newAskWork);
  }

  async update(
    id: string,
    data: UpdateAskWorkDto,
    file: any,
  ): Promise<AskWork> {
    const {
      type,
      status,
      comment,
      scheduleStartDate,
      scheduleEndDate,
      workers,
    } = data;
    const team = [];
    if (typeof workers === 'string') {
      const workersData = JSON.parse(workers);
      for (let i = 0; i <= workersData.length - 1; i++) {
        const workerData = await this.workerService.getById(workersData[i]);
        team.push(workerData);

        if (!workerData)
          throw new NotFoundException(RESPONSE_MESSAGES.WORKER_NOT_FOUND);
      }
    }

    const askWork = await this.getById(id);

    if (!askWork)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_WORK_NOT_FOUND);

    if (type === 'new') {
      this.askWorkRepository.merge(askWork, {
        status: status as REQUEST,
        comment,
        file: file.filename,
        originalFileName: file.originalname,
        scheduleEndDate,
        scheduleStartDate,
        workers: team,
      });
    } else if (type === 'keep') {
      this.askWorkRepository.merge(askWork, {
        comment,
        status: status as REQUEST,
        scheduleEndDate,
        scheduleStartDate,
        workers: team,
      });
    } else {
      this.askWorkRepository.merge(askWork, {
        status: status as REQUEST,
        comment,
        file: null,
        originalFileName: null,
        scheduleEndDate,
        scheduleStartDate,
        workers: team,
      });
    }

    return await this.askWorkRepository.save(askWork);
  }

  async updateOnUser(
    id: string,
    data: UpdateAskWorkOnUserDto,
    files: any,
  ): Promise<AskWork> {
    const askWork = await this.getById(id);

    if (!askWork)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_WORK_NOT_FOUND);

    if (files.completedFile && files.defaultFile) {
      this.askWorkRepository.merge(askWork, {
        ...data,
        completedFile: files.completedFile[0].filename,
        defaultFile: files.defaultFile[0].filename,
      });
    } else if (!files.completedFile && files.defaultFile) {
      this.askWorkRepository.merge(askWork, {
        ...data,
        defaultFile: files.defaultFile[0].filename,
        completedFile: askWork.completedFile,
      });
    } else if (files.completedFile && !files.defaultFile) {
      this.askWorkRepository.merge(askWork, {
        ...data,
        completedFile: files.completedFile[0].filename,
        defaultFile: askWork.defaultFile,
      });
    } else {
      this.askWorkRepository.merge(askWork, {
        ...data,
        defaultFile: askWork.defaultFile,
        completedFile: askWork.completedFile,
      });
    }
    return await this.askWorkRepository.save(askWork);
  }

  async fetchSubmitStatus(window_id: string, userId: string): Promise<AskWork> {
    const window = await this.windowService.getById(window_id);

    if (!window)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);

    return await this.askWorkRepository.findOne({
      where: {
        window: { id: window_id },
        user: { id: userId },
        status: In([
          REQUEST.NEW_REQUEST,
          REQUEST.SCHEDULED,
          REQUEST.DONE,
          REQUEST.REOPEN,
        ]),
      },
    });
  }

  async fetchAll(query: any) {
    const windowId = query.params?.windowId || '';
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    const status = query.params?.status || '';
    let queryBuilder = this.askWorkRepository
      .createQueryBuilder('askWork')
      .leftJoinAndSelect('askWork.user', 'user')
      .leftJoinAndSelect('askWork.window', 'window')
      .leftJoinAndSelect('window.room', 'room')
      .leftJoinAndSelect('room.stage', 'stage')
      .leftJoinAndSelect('stage.hotel', 'hotel');

    if (windowId) {
      queryBuilder = queryBuilder.andWhere('askWork.window.id = :windowId', {
        windowId: windowId,
      });
    }

    if (status !== '') {
      queryBuilder = queryBuilder.andWhere('askWork.status = :status', {
        status: status,
      });
    } else {
      queryBuilder = queryBuilder.andWhere('askWork.status IN (:...statuses)', {
        statuses: [
          REQUEST.NEW_REQUEST,
          REQUEST.DONE,
          REQUEST.CLOSED,
          REQUEST.SCHEDULED,
          REQUEST.REOPEN,
        ],
      });
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

  async cancelRequest(ask_work_id: string) {
    const askWork = await this.getById(ask_work_id);

    if (!askWork)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_WORK_NOT_FOUND);

    await this.workerService.endRequest(ask_work_id, 'askWork');

    askWork.status = REQUEST.CLOSED;

    return this.askWorkRepository.save(askWork);
  }

  async doneRequest(ask_work_id: string) {
    const askWork = await this.getById(ask_work_id);

    if (!askWork)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_WORK_NOT_FOUND);

    if (askWork.status === REQUEST.DONE) {
      throw new BadRequestException(RESPONSE_MESSAGES.ALREADY_DONE);
    }

    askWork.status = REQUEST.DONE;

    return this.askWorkRepository.save(askWork);
  }

  async reopenRequest(ask_work_id: string) {
    const askWork = await this.getById(ask_work_id);

    if (!askWork)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_WORK_NOT_FOUND);

    if (askWork.status === REQUEST.REOPEN) {
      throw new BadRequestException(RESPONSE_MESSAGES.ALREADY_REOPEN);
    }

    askWork.status = REQUEST.REOPEN;

    return this.askWorkRepository.save(askWork);
  }

  async fetchStatistics(query: any) {
    const windowId = query.params?.windowId || '';
    const roomId = query.params?.roomId || '';
    const stageId = query.params?.stageId || '';
    const hotelId = query.params?.hotelId || '';
    let queryBuilder = this.askWorkRepository
      .createQueryBuilder('askWork')
      .leftJoinAndSelect('askWork.user', 'user')
      .leftJoinAndSelect('askWork.window', 'window')
      .leftJoinAndSelect('window.room', 'room')
      .leftJoinAndSelect('room.stage', 'stage')
      .leftJoinAndSelect('stage.hotel', 'hotel');

    if (windowId) {
      queryBuilder = queryBuilder.andWhere('askWork.window.id = :windowId', {
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
