import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateWindowDto } from './dto/create-window.dto';
import { UpdateWindowDto } from './dto/update-window.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { Window } from './entities';
import { RoomService } from '../room/room.service';

@Injectable()
export class WindowService {
  constructor(
    @InjectRepository(Window)
    private readonly windowRepository: Repository<Window>,
    private readonly roomService: RoomService,
  ) {}
  async getAll(query: any) {
    const roomId = query.params.roomId || null;
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    return this.windowRepository
      .createQueryBuilder('window')
      .leftJoinAndSelect('window.room', 'room')
      .where('window.name ILIKE(:name)', {
        name: `%${keyword}%`,
      })
      .andWhere('window.room.id = :roomId', {
        roomId: roomId,
      })
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
  }

  async getById(id: string): Promise<Window> {
    const window = await this.windowRepository.findOne({
      where: { id },
      relations: [
        'room',
        'room.stage',
        'room.stage.hotel',
        'room.stage.hotel.stages',
      ],
    });

    if (!window)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);

    return window;
  }

  async create(data: CreateWindowDto): Promise<Window> {
    const room = await this.roomService.getById(data.roomId);

    if (!room) {
      throw new NotFoundException(RESPONSE_MESSAGES.ROOM_NOT_FOUND);
    }

    const newWindow = this.windowRepository.create({
      name: data.name,
      description: data.description,
      room: room,
    });
    return await this.windowRepository.save(newWindow);
  }

  async update(id: string, data: UpdateWindowDto): Promise<Window> {
    const window = await this.getById(id);

    if (!window)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);

    this.windowRepository.merge(window, data);
    return await this.windowRepository.save(window);
  }

  async delete(id: string): Promise<any> {
    const window = await this.getById(id);

    if (!window)
      throw new NotFoundException(RESPONSE_MESSAGES.WINDOW_NOT_FOUND);

    return await this.windowRepository.remove(window);
  }
}
