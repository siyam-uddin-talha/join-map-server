import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { Room } from './entities';
import { StageService } from '../stage/stage.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly stageService: StageService,
  ) {}
  async getAll(query: any) {
    const stageId = query.params.stageId || null;
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    return this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.stage', 'stage')
      .where('room.name ILIKE(:name)', {
        name: `%${keyword}%`,
      })
      .andWhere('room.stage.id = :stageId', {
        stageId: stageId,
      })
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
  }

  async getById(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['stage', 'stage.hotel', 'stage.hotel.stages'],
    });

    if (!room) throw new NotFoundException(RESPONSE_MESSAGES.ROOM_NOT_FOUND);

    return room;
  }

  async create(data: CreateRoomDto): Promise<Room> {
    const stage = await this.stageService.getById(data.stageId);

    if (!stage) {
      throw new NotFoundException(RESPONSE_MESSAGES.STAGE_NOT_FOUND);
    }

    const newRoom = this.roomRepository.create({
      name: data.name,
      stage: stage,
    });
    return await this.roomRepository.save(newRoom);
  }

  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    const room = await this.getById(id);

    if (!room) throw new NotFoundException(RESPONSE_MESSAGES.ROOM_NOT_FOUND);

    this.roomRepository.merge(room, data);
    return await this.roomRepository.save(room);
  }

  async delete(id: string): Promise<any> {
    const room = await this.getById(id);

    if (!room) throw new NotFoundException(RESPONSE_MESSAGES.ROOM_NOT_FOUND);

    return await this.roomRepository.remove(room);
  }
}
