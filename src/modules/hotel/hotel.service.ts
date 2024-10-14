import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { Hotel } from './entities';
import * as xlsx from 'xlsx';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async getAll(query: any) {
    const keyword = query.params?.keyword || '';
    const page = query.params?.page || 1;
    const size = query.params?.size || 10;
    return this.hotelRepository
      .createQueryBuilder('hotel')
      .where('hotel.name ILIKE(:name)', {
        name: `%${keyword}%`,
      })
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
  }

  async getById(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['stages', 'stages.rooms', 'stages.rooms.windows'],
    });

    if (!hotel) throw new NotFoundException(RESPONSE_MESSAGES.HOTEL_NOT_FOUND);

    return hotel;
  }

  async create(data: CreateHotelDto, file: any): Promise<Hotel> {
    const newHotel = this.hotelRepository.create({
      ...data,
      image: file?.filename,
    });
    return await this.hotelRepository.save(newHotel);
  }

  async uploadExcelFile(file: any) {
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const hotels = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    hotels.shift();
    const parsedHotels = hotels.map((row: any[]) => {
      // Check if the row has the expected number of fields
      if (row.length !== 4) {
        throw new Error('Invalid row structure');
      }

      const [latitude, longitude, description, name] = row;
      return { latitude, longitude, description, name };
    });

    return this.hotelRepository.save(parsedHotels);
  }

  async update(id: string, data: UpdateHotelDto, file: any): Promise<Hotel> {
    const { type, ...rest } = data;
    const hotel = await this.getById(id);

    if (!hotel) throw new NotFoundException(RESPONSE_MESSAGES.HOTEL_NOT_FOUND);

    if (type === 'new') {
      this.hotelRepository.merge(hotel, {
        ...rest,
        image: file.filename,
      });
    } else if (type === 'keep') {
      this.hotelRepository.merge(hotel, rest);
    } else {
      this.hotelRepository.merge(hotel, {
        ...rest,
        image: null,
      });
    }

    return await this.hotelRepository.save(hotel);
  }

  async delete(id: string): Promise<any> {
    const hotel = await this.getById(id);

    if (!hotel) throw new NotFoundException(RESPONSE_MESSAGES.HOTEL_NOT_FOUND);

    return await this.hotelRepository.remove(hotel);
  }
}
