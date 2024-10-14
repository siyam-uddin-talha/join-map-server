import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateAskAuditDto } from './dto/create-ask-audit.dto';
import { UpdateAskAuditDto } from './dto/update-ask-audit.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { AskAudit } from './entities';
import { UserService } from '../user/user.service';
import { WindowService } from '../window/window.service';
import { REQUEST } from '../../constants/request-types';
import { UpdateAskAuditUserDto } from './dto/update-ask-audit-user.dto';
import { WorkerService } from '../worker/worker.service';

@Injectable()
export class AskAuditService {
  constructor(
    @InjectRepository(AskAudit)
    private readonly askAuditRepository: Repository<AskAudit>,
    private readonly userService: UserService,
    private readonly windowService: WindowService,
    private readonly workerService: WorkerService,
  ) {}

  async getById(id: string): Promise<AskAudit> {
    const askAudit = await this.askAuditRepository.findOne({
      where: { id },
      relations: ['workers'],
    });

    if (!askAudit)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_AUDIT_NOT_FOUND);

    return askAudit;
  }

  async fetchAll(query: any) {
    const windowId = query.params?.windowId || '';
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    const status = query.params?.status || '';
    let queryBuilder = this.askAuditRepository
      .createQueryBuilder('askAudit')
      .leftJoinAndSelect('askAudit.user', 'user')
      .leftJoinAndSelect('askAudit.window', 'window')
      .leftJoinAndSelect('window.room', 'room')
      .leftJoinAndSelect('room.stage', 'stage')
      .leftJoinAndSelect('stage.hotel', 'hotel');

    if (windowId) {
      queryBuilder = queryBuilder.andWhere('askAudit.window.id = :windowId', {
        windowId,
      });
    }

    if (status !== '') {
      queryBuilder = queryBuilder.andWhere('askAudit.status = :status', {
        status: status,
      });
    } else {
      queryBuilder = queryBuilder.andWhere(
        'askAudit.status IN (:...statuses)',
        {
          statuses: [
            REQUEST.NEW_REQUEST,
            REQUEST.DONE,
            REQUEST.CLOSED,
            REQUEST.SCHEDULED,
            REQUEST.REOPEN,
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

  async create(
    data: CreateAskAuditDto,
    userId: string,
    files: any,
  ): Promise<AskAudit> {
    const { windowId, ...rest } = data;
    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);
    }

    const window = await this.windowService.getById(windowId);

    if (!window) {
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);
    }

    const newAskAudit = this.askAuditRepository.create({
      ...rest,
      status: REQUEST.NEW_REQUEST,
      user: user,
      window: window,
      planFile: files.planFile[0].filename,
      joineryPhotoFile: files.joineryPhotoFile[0].filename,
    });
    return await this.askAuditRepository.save(newAskAudit);
  }

  async update(
    id: string,
    data: UpdateAskAuditDto,
    file: any,
  ): Promise<AskAudit> {
    const {
      type,
      status,
      comment,
      scheduleEndDate,
      scheduleStartDate,
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

    const askAudit = await this.getById(id);

    if (!askAudit)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_AUDIT_NOT_FOUND);

    if (type === 'new') {
      this.askAuditRepository.merge(askAudit, {
        status: status as REQUEST,
        comment,
        file: file.filename,
        originalFileName: file.originalname,
        scheduleEndDate,
        scheduleStartDate,
        workers: team,
      });
    } else if (type === 'keep') {
      this.askAuditRepository.merge(askAudit, {
        comment,
        status: status as REQUEST,
        scheduleEndDate,
        scheduleStartDate,
        workers: team,
      });
    } else {
      this.askAuditRepository.merge(askAudit, {
        status: status as REQUEST,
        comment,
        file: null,
        originalFileName: null,
        scheduleEndDate,
        scheduleStartDate,
        workers: team,
      });
    }

    return await this.askAuditRepository.save(askAudit);
  }

  async updateOnUser(
    id: string,
    data: UpdateAskAuditUserDto,
    files: any,
  ): Promise<AskAudit> {
    const askAudit = await this.getById(id);

    if (!askAudit)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_AUDIT_NOT_FOUND);

    if (files.planFile && files.joineryPhotoFile) {
      this.askAuditRepository.merge(askAudit, {
        ...data,
        planFile: files.planFile[0].filename,
        joineryPhotoFile: files.joineryPhotoFile[0].filename,
      });
    } else if (!files.planFile && files.joineryPhotoFile) {
      this.askAuditRepository.merge(askAudit, {
        ...data,
        joineryPhotoFile: files.joineryPhotoFile[0].filename,
        planFile: askAudit.planFile,
      });
    } else if (files.planFile && !files.joineryPhotoFile) {
      this.askAuditRepository.merge(askAudit, {
        ...data,
        planFile: files.planFile[0].filename,
        joineryPhotoFile: askAudit.joineryPhotoFile,
      });
    } else {
      this.askAuditRepository.merge(askAudit, {
        ...data,
        planFile: askAudit.planFile,
        joineryPhotoFile: askAudit.joineryPhotoFile,
      });
    }
    return await this.askAuditRepository.save(askAudit);
  }

  async fetchSubmitStatus(
    window_id: string,
    userId: string,
  ): Promise<AskAudit> {
    const window = await this.windowService.getById(window_id);

    if (!window)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);

    return await this.askAuditRepository.findOne({
      where: {
        window: { id: window_id },
        user: { id: userId },
        status: In([
          REQUEST.DONE,
          REQUEST.NEW_REQUEST,
          REQUEST.SCHEDULED,
          REQUEST.REOPEN,
        ]),
      },
    });
  }

  async cancelRequest(ask_audit_id: string) {
    const askAudit = await this.getById(ask_audit_id);

    if (!askAudit)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_AUDIT_NOT_FOUND);

    await this.workerService.endRequest(ask_audit_id, 'askAudit');

    askAudit.status = REQUEST.CLOSED;

    return this.askAuditRepository.save(askAudit);
  }

  async doneRequest(ask_audit_id: string) {
    const askAudit = await this.getById(ask_audit_id);

    if (!askAudit)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_AUDIT_NOT_FOUND);

    if (askAudit.status === REQUEST.DONE) {
      throw new BadRequestException(RESPONSE_MESSAGES.ALREADY_DONE);
    }

    askAudit.status = REQUEST.DONE;

    return this.askAuditRepository.save(askAudit);
  }

  async reopenRequest(ask_audit_id: string) {
    const askAudit = await this.getById(ask_audit_id);

    if (!askAudit)
      throw new NotFoundException(RESPONSE_MESSAGES.ASK_AUDIT_NOT_FOUND);

    if (askAudit.status === REQUEST.REOPEN) {
      throw new BadRequestException(RESPONSE_MESSAGES.ALREADY_REOPEN);
    }

    askAudit.status = REQUEST.REOPEN;

    return this.askAuditRepository.save(askAudit);
  }

  async fetchStatistics(query: any) {
    const windowId = query.params?.windowId || '';
    const roomId = query.params?.roomId || '';
    const stageId = query.params?.stageId || '';
    const hotelId = query.params?.hotelId || '';
    let queryBuilder = this.askAuditRepository
      .createQueryBuilder('askAudit')
      .leftJoinAndSelect('askAudit.user', 'user')
      .leftJoinAndSelect('askAudit.window', 'window')
      .leftJoinAndSelect('window.room', 'room')
      .leftJoinAndSelect('room.stage', 'stage')
      .leftJoinAndSelect('stage.hotel', 'hotel');

    if (windowId) {
      queryBuilder = queryBuilder.andWhere('askAudit.window.id = :windowId', {
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
