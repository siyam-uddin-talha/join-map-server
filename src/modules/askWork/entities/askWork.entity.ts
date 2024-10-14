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
import { User } from '../../user/entities';
import { Window } from '../../window/entities';
import { REQUEST, REQUEST_VALUES } from '../../../constants/request-types';
import { Worker } from '../../worker/entities';

@Entity('ask-work')
export class AskWork {
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

  @ApiProperty({
    example: REQUEST.NEW_REQUEST,
    description: 'New request for ask for work',
  })
  @Column({ type: 'enum', default: REQUEST.NEW_REQUEST, enum: REQUEST_VALUES })
  public status: REQUEST;

  @ApiProperty({
    example: 'This is admin windowComment',
    description: 'Admin Comment',
  })
  @Column({ type: 'text', nullable: true })
  public comment: string;

  @ApiProperty({
    example: 'This is a file',
    description: 'Attached by admin',
  })
  @Column({ type: 'text', nullable: true })
  public file: string;

  @ApiProperty({
    example: 'This is an originalFileName',
    description: 'Attached by admin',
  })
  @Column({ type: 'text', nullable: true })
  public originalFileName: string;

  @ApiProperty({
    example: 'This is applicant full name',
    description: 'Full Name',
  })
  @Column({ type: 'text' })
  public applicantFullName: string;

  @ApiProperty({
    example: 'This is applicant tel',
    description: '111-111',
  })
  @Column({ type: 'text' })
  public applicantTel: string;

  @ApiProperty({
    example: 'This is applicant date',
    description: '2023-11-01',
  })
  @Column({ type: 'text' })
  public applicantDate: string;

  @ApiProperty({
    example: 'This is location name',
    description: 'Location',
  })
  @Column({ type: 'text' })
  public locationName: string;

  @ApiProperty({
    example: 'This is location address',
    description: 'Location Address',
  })
  @Column({ type: 'text' })
  public locationAddress: string;

  @ApiProperty({
    example: 'This is location cp',
    description: 'Location Cp',
  })
  @Column({ type: 'text' })
  public locationCp: string;

  @ApiProperty({
    example: 'This is location city',
    description: 'Location City',
  })
  @Column({ type: 'text' })
  public locationCity: string;

  @ApiProperty({
    example: 'This is local contact full name',
    description: 'Local Contact Full Name',
  })
  @Column({ type: 'text' })
  public localContactFullName: string;

  @ApiProperty({
    example: 'This is local contact tel',
    description: 'Local Contact Tel',
  })
  @Column({ type: 'text' })
  public localContactTel: string;

  @ApiProperty({
    example: 'This is installation year',
    description: '5',
  })
  @Column({ type: 'text' })
  public installationYear: string;

  @ApiProperty({
    example: 'This is manufacturer brand',
    description: '5',
  })
  @Column({ type: 'text' })
  public manufacturerBrand: string;

  @ApiProperty({
    example: 'This is dimension',
    description: 'dimension',
  })
  @Column({ type: 'text' })
  public dimensions: string;

  @ApiProperty({
    example: 'This is glazing type',
    description: 'glazing type',
  })
  @Column({ type: 'text' })
  public glazingType: string;

  @ApiProperty({
    example: 'This is additional info',
    description: 'additional info',
  })
  @Column({ type: 'text' })
  public additionalInfo: string;

  @ApiProperty({
    example: 'This is special constraints',
    description: 'special constraints',
  })
  @Column({ type: 'text' })
  public specialConstraints: string;

  @ApiProperty({
    example: 'This is accessibility',
    description: 'accessibility',
  })
  @Column({ type: 'text' })
  public accessibility: string;

  @ApiProperty({
    example: 'This is available',
    description: 'available',
  })
  @Column({ type: 'text' })
  public available: string;

  @ApiProperty({
    example: 'This is material',
    description: 'material',
  })
  @Column({ type: 'text' })
  public material: string;

  @ApiProperty({
    example: 'This is element concerned',
    description: 'element concerned',
  })
  @Column({ type: 'text' })
  public elementConcerned: string;

  @ApiProperty({
    example: 'This is deadline',
    description: 'deadline',
  })
  @Column({ type: 'integer' })
  public deadline: number;

  @ApiProperty({
    example: 'This is object request',
    description: 'object request',
  })
  @Column({ type: 'text' })
  public objectRequest: string;

  @ApiProperty({
    example: 'This is a completed image',
    description: 'Attached by all user',
  })
  @Column({ type: 'text' })
  public completedFile: string;

  @ApiProperty({
    example: 'This is a default file',
    description: 'Attached by all user',
  })
  @Column({ type: 'text' })
  public defaultFile: string;

  @ApiProperty({
    example: 'This is a default file',
    description: 'Attached by all user',
  })
  @Column({ type: Date, nullable: true })
  public scheduleStartDate: Date;

  @ApiProperty({
    example: 'This is a default file',
    description: 'Attached by all user',
  })
  @Column({ type: Date, nullable: true })
  public scheduleEndDate: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  public user: User;

  @ManyToOne(() => Window, (window) => window.askWorks, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  public window: Window;

  @OneToMany(() => Worker, (worker) => worker.askWork, { cascade: true })
  public workers: Worker[];
}