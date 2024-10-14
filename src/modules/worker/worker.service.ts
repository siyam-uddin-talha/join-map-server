import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from "typeorm";

import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { Worker } from './entities';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { TokenService } from '../token/token.service';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}
  async getAll(query: any) {
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    return this.workerRepository
      .createQueryBuilder('worker')
      .where('worker.address ILIKE(:address)', {
        address: `%${keyword}%`,
      })
      .orWhere('worker.name ILIKE(:name)', {
        name: `%${keyword}%`,
      })
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
  }

  async getAllFreeWorkers() {
    return await this.workerRepository.find({
      where: {
        askWork: null,
        askAudit: null,
        otpVerifiedAt: Not(IsNull()),
        password: Not(IsNull()),
      },
    });
  }

  async getById(id: string): Promise<Worker> {
    return await this.workerRepository.findOne({
      where: { id },
    });
  }

  async getByEmail(email: string): Promise<Worker> {
    return await this.workerRepository.findOne({
      where: { email },
    });
  }

  async fetchCurrentRequest(id: string): Promise<Worker> {
    const worker = await this.workerRepository.findOne({
      where: { id },
      relations: ['askWork', 'askAudit'],
    });

    if (!worker) {
      throw new BadRequestException(RESPONSE_MESSAGES.WORKER_NOT_FOUND);
    }

    return worker;
  }

  async endRequest(requestId: string, type: string) {
    let workers: Worker[];
    if (type === 'askWork') {
      workers = await this.workerRepository.find({
        where: { askWork: { id: requestId } },
      });
      for (let i = 0; i < workers.length; i++) {
        const worker = await this.getById(workers[i].id);
        worker.askWork = null;
        await this.workerRepository.save(worker);
      }
    } else {
      workers = await this.workerRepository.find({
        where: { askAudit: { id: requestId } },
      });
      for (let i = 0; i < workers.length; i++) {
        const worker = await this.getById(workers[i].id);
        worker.askAudit = null;
        await this.workerRepository.save(worker);
      }
    }
  }

  async fetchTeamMembers(id: string): Promise<Worker[]> {
    const worker = await this.workerRepository.findOne({
      where: { id },
      relations: ['askWork', 'askAudit'],
    });

    if (!worker) {
      throw new BadRequestException(RESPONSE_MESSAGES.WORKER_NOT_FOUND);
    }

    if (worker.askWork) {
      return await this.workerRepository.find({
        where: { askWork: { id: worker.askWork.id } },
      });
    } else if (worker.askAudit) {
      return await this.workerRepository.find({
        where: { askAudit: { id: worker.askAudit.id } },
      });
    }
  }

  async create(
    data: CreateWorkerDto,
  ): Promise<{ worker: Worker; randomString: string }> {
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
    const newWorker = this.workerRepository.create({
      ...data,
      otp: hashOtp,
    });

    const worker = await this.workerRepository.save(newWorker);

    // await this.mailerService.sendMail({
    //   to: data.email,
    //   subject: 'Join Map - One time password for you',
    //   html: `<span>One time password: ${randomString}</span>`,
    // });
    console.log(`One time password - ${randomString}`);

    const { refreshToken } = await this.tokenService.generateTokens(
      worker,
      'worker',
    );

    await this.tokenService.create(worker.id, refreshToken);

    return { worker, randomString };
  }

  async update(id: string, data: UpdateWorkerDto): Promise<Worker> {
    const worker = await this.getById(id);

    if (!worker)
      throw new NotFoundException(RESPONSE_MESSAGES.WORKER_NOT_FOUND);

    this.workerRepository.merge(worker, data);
    return await this.workerRepository.save(worker);
  }

  async delete(id: string): Promise<any> {
    const worker = await this.getById(id);

    if (!worker)
      throw new NotFoundException(RESPONSE_MESSAGES.WORKER_NOT_FOUND);

    return await this.workerRepository.remove(worker);
  }

  async updatePassword(id: string, password: string) {
    const worker = await this.getById(id);

    const updatedWorker = Object.assign(worker, { password });

    return this.workerRepository.save(updatedWorker);
  }
}
