import { ApiProperty } from '@nestjs/swagger';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Hotel } from '../../hotel/entities';
import { Room } from '../../room/entities';

@Entity('stage')
export class Stage {
  @ApiProperty({
    example: 'ffa31807-f019-43d7-a2b9-d2f899784d72',
    description: 'Unique identifier (autogenerated)',
    required: false,
  })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt: Date;

  @ApiProperty({ example: 'Rest Stage', description: 'Stage Name' })
  @Column({ type: 'text' })
  public name: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.stages, { onDelete: 'SET NULL' })
  @JoinColumn()
  public hotel: Hotel;

  @OneToMany(() => Room, (room) => room.stage, { cascade: true })
  public rooms: Room[];
}
