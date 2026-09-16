import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotificationChannel } from '@prisma/client';

export interface DispatchNotificationPayload {
  title: string;
  body: string;
  linkPath: string;
  iconType?: string;
  [key: string]: unknown;
}

export class DispatchNotificationDto {
  @IsNotEmpty({ message: 'triggerType wajib diisi' })
  @IsString({ message: 'triggerType harus berupa string' })
  triggerType!: string;

  @IsNotEmpty({ message: 'recipientUserId wajib diisi' })
  @IsUUID('4', { message: 'recipientUserId harus berupa UUID valid' })
  recipientUserId!: string;

  @IsOptional()
  @IsString({ message: 'relatedEntityType harus berupa string' })
  relatedEntityType?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'relatedEntityId harus berupa UUID valid' })
  relatedEntityId?: string | null;

  @IsOptional()
  @IsEnum(NotificationChannel, { message: 'channel tidak valid' })
  channel?: NotificationChannel;

  @IsOptional()
  @IsArray({ message: 'channels harus berupa array' })
  @IsEnum(NotificationChannel, { each: true, message: 'channel dalam array tidak valid' })
  channels?: NotificationChannel[];

  @IsNotEmpty({ message: 'payload wajib diisi' })
  @IsObject({ message: 'payload harus berupa object' })
  payload!: DispatchNotificationPayload;
}
