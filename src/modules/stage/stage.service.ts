import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { Stage } from './entities';
import { HotelService } from '../hotel/hotel.service';

@Injectable()
export class StageService {
  constructor(
    @InjectRepository(Stage)
    private readonly stageRepository: Repository<Stage>,
    private readonly hotelService: HotelService,
  ) {}
  async getAll(query: any) {
    const hotelId = query.params.hotelId || null;
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    return this.stageRepository
      .createQueryBuilder('stage')
      .leftJoinAndSelect('stage.hotel', 'hotel')
      .leftJoinAndSelect('stage.rooms', 'rooms')
      .where('stage.name ILIKE(:name)', {
        name: `%${keyword}%`,
      })
      .andWhere('stage.hotel.id = :hotelId', {
        hotelId: hotelId,
      })
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
  }

  async getById(id: string): Promise<Stage> {
    const stage = await this.stageRepository.findOne({
      where: { id },
      relations: ['rooms', 'hotel', 'hotel.stages'],
    });

    if (!stage) throw new NotFoundException(RESPONSE_MESSAGES.STAGE_NOT_FOUND);

    return stage;
  }

  async create(data: CreateStageDto): Promise<Stage> {
    const hotel = await this.hotelService.getById(data.hotelId);

    if (!hotel) {
      throw new NotFoundException(RESPONSE_MESSAGES.HOTEL_NOT_FOUND);
    }

    const newStage = this.stageRepository.create({
      name: data.name,
      hotel: hotel,
    });
    return await this.stageRepository.save(newStage);
  }

  async update(id: string, data: UpdateStageDto): Promise<Stage> {
    const stage = await this.getById(id);

    if (!stage) throw new NotFoundException(RESPONSE_MESSAGES.STAGE_NOT_FOUND);

    this.stageRepository.merge(stage, data);
    return await this.stageRepository.save(stage);
  }

  async delete(id: string): Promise<any> {
    const stage = await this.getById(id);

    if (!stage) throw new NotFoundException(RESPONSE_MESSAGES.STAGE_NOT_FOUND);

    return await this.stageRepository.remove(stage);
  }
}
